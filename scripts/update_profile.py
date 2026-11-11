#!/usr/bin/env python3
"""Refresh the GitHub profile README with live GitHub data.

The script is intentionally dependency-free so the scheduled GitHub Actions
workflow can run it with the system Python and no install step.

Data sources
------------
REST    /users/{user}, /users/{user}/repos, /repos/{owner}/{repo}/languages,
        /users/{user}/events/public
GraphQL contributionsCollection for the current and previous calendar years.

Outputs
-------
assets/activity.svg             statistics and language mix
assets/contribution-graph.svg   contribution heatmap
README.md                       recent public activity between the ACTIVITY markers

A failed API call skips only the data it provides. Existing SVGs are left in
place rather than being replaced with empty placeholders.
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from collections import Counter
from datetime import date, datetime, timedelta, timezone
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
README = ROOT / "README.md"
ASSETS = ROOT / "assets"
ACTIVITY_SVG = ASSETS / "activity.svg"
HEATMAP_SVG = ASSETS / "contribution-graph.svg"

USER = os.environ.get("PROFILE_USER", "sarvajithsankar")
TOKEN = (
    os.environ.get("PROFILE_TOKEN")
    or os.environ.get("GITHUB_TOKEN")
    or os.environ.get("GH_TOKEN")
)
API = "https://api.github.com"
GRAPHQL_URL = "https://api.github.com/graphql"

NOW = datetime.now(timezone.utc)
TODAY = NOW.date()
YEAR = TODAY.year

BG = "#080810"
PANEL = "#0B1020"
LINE = "#24134A"
INK = "#E5E7EB"
MUTED = "#9294A5"
VIOLET = "#8B5CF6"
INDIGO = "#6366F1"
CYAN = "#22D3EE"
LAVENDER = "#A78BFA"
DEEP = "#4C2A8A"
HEAT = ["#15102E", "#24134A", "#4C2A8A", "#7C3AED", "#A78BFA"]
FONT_MONO = (
    "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
)
FONT_SANS = (
    "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
)

LANG_COLORS = {
    "Python": VIOLET,
    "Jupyter Notebook": INDIGO,
    "C++": CYAN,
    "Java": LAVENDER,
    "TypeScript": DEEP,
    "JavaScript": VIOLET,
    "CSS": CYAN,
    "HTML": INDIGO,
    "C": LAVENDER,
    "Batchfile": DEEP,
}
FALLBACK_LANG_COLORS = [VIOLET, INDIGO, CYAN, LAVENDER, DEEP]

CONTRIB_QUERY = """
query($login: String!, $from: DateTime!, $to: DateTime!, $prevFrom: DateTime!, $prevTo: DateTime!) {
  user(login: $login) {
    current: contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      restrictedContributionsCount
    }
    previous: contributionsCollection(from: $prevFrom, to: $prevTo) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
"""


def warn(message: str) -> None:
    print(f"::warning::{message}")


def api_request(url: str, *, data: bytes | None = None, method: str = "GET"):
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": f"{USER}-profile-updater",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    if data is not None:
        headers["Content-Type"] = "application/json"

    for attempt in range(3):
        try:
            request = urllib.request.Request(url, data=data, headers=headers, method=method)
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            remaining = exc.headers.get("X-RateLimit-Remaining")
            retryable = exc.code == 429 or (exc.code == 403 and remaining == "0")
            if retryable and attempt < 2:
                retry_after = int(exc.headers.get("Retry-After", "5") or 5)
                time.sleep(min(retry_after, 30))
                continue
            raise
        except (urllib.error.URLError, TimeoutError):
            if attempt < 2:
                time.sleep(3 * (attempt + 1))
                continue
            raise


def graphql(query: str, variables: dict):
    if not TOKEN:
        warn("No GitHub token found; contribution data will be skipped.")
        return None
    payload = json.dumps({"query": query, "variables": variables}).encode("utf-8")
    try:
        result = api_request(GRAPHQL_URL, data=payload, method="POST")
    except Exception as exc:  # noqa: BLE001 - the workflow should survive API failures
        warn(f"GraphQL request failed: {exc}")
        return None
    if result.get("errors"):
        messages = "; ".join(str(err.get("message", "unknown error")) for err in result["errors"])
        warn(f"GraphQL returned errors: {messages}")
        return None
    return result.get("data")


def fetch_profile():
    try:
        return api_request(f"{API}/users/{USER}")
    except Exception as exc:  # noqa: BLE001
        warn(f"Profile request failed: {exc}")
        return None


def fetch_repos():
    try:
        repos = api_request(
            f"{API}/users/{USER}/repos?per_page=100&type=owner&sort=pushed&direction=desc"
        )
        return repos if isinstance(repos, list) else []
    except Exception as exc:  # noqa: BLE001
        warn(f"Repository request failed: {exc}")
        return []


def fetch_languages(repos: list[dict]) -> Counter:
    totals: Counter = Counter()
    for repo in repos:
        if repo.get("fork"):
            continue
        name = repo.get("name")
        if not name:
            continue
        try:
            languages = api_request(f"{API}/repos/{USER}/{name}/languages")
        except Exception:  # noqa: BLE001 - one repo should not stop the update
            continue
        if isinstance(languages, dict):
            for language, size in languages.items():
                if isinstance(size, int):
                    totals[language] += size
    return totals


def fetch_events():
    try:
        events = api_request(f"{API}/users/{USER}/events/public?per_page=30")
        return events if isinstance(events, list) else []
    except Exception as exc:  # noqa: BLE001
        warn(f"Events request failed: {exc}")
        return None


def fetch_contributions():
    start = datetime(YEAR, 1, 1, tzinfo=timezone.utc)
    end = NOW
    previous_start = datetime(YEAR - 1, 1, 1, tzinfo=timezone.utc)
    previous_end = datetime(YEAR - 1, 12, 31, 23, 59, 59, tzinfo=timezone.utc)

    def stamp(value: datetime) -> str:
        return value.replace(microsecond=0).isoformat().replace("+00:00", "Z")

    data = graphql(
        CONTRIB_QUERY,
        {
            "login": USER,
            "from": stamp(start),
            "to": stamp(end),
            "prevFrom": stamp(previous_start),
            "prevTo": stamp(previous_end),
        },
    )
    if not data or not data.get("user"):
        warn("Contribution data unavailable; the token may lack the read:user scope.")
        return None
    return data["user"]


def calendar_days(collection: dict) -> list[dict]:
    weeks = collection.get("contributionCalendar", {}).get("weeks", [])
    return [day for week in weeks for day in week.get("contributionDays", [])]


def compute_streaks(days: list[dict]) -> tuple[int, int]:
    counts = {
        date.fromisoformat(day["date"]): int(day.get("contributionCount", 0))
        for day in days
        if day.get("date", "").startswith(str(YEAR))
    }
    if not counts:
        return 0, 0

    current = 0
    cursor = TODAY if counts.get(TODAY, 0) > 0 else TODAY - timedelta(days=1)
    while counts.get(cursor, 0) > 0:
        current += 1
        cursor -= timedelta(days=1)

    longest = run = 0
    for day in sorted(counts):
        if counts[day] > 0:
            run += 1
            longest = max(longest, run)
        else:
            run = 0
    return current, longest


def fmt_number(value: int | None) -> str:
    return "—" if value is None else f"{value:,}"


def svg_text(
    x: float,
    y: float,
    content,
    *,
    size: float,
    fill: str,
    weight: int | None = None,
    anchor: str | None = None,
    family: str = FONT_SANS,
    opacity: float | None = None,
    letter_spacing: float | None = None,
) -> str:
    attrs = [
        f'x="{x}"',
        f'y="{y}"',
        f'font-size="{size}"',
        f'fill="{fill}"',
        f'font-family="{family}"',
    ]
    if weight is not None:
        attrs.append(f'font-weight="{weight}"')
    if anchor is not None:
        attrs.append(f'text-anchor="{anchor}"')
    if opacity is not None:
        attrs.append(f'fill-opacity="{opacity}"')
    if letter_spacing is not None:
        attrs.append(f'letter-spacing="{letter_spacing}"')
    return f"  <text {' '.join(attrs)}>{escape(str(content))}</text>"


def language_mix(languages: Counter) -> list[tuple[str, float, int]]:
    if not languages:
        return []
    total = sum(languages.values())
    if total <= 0:
        return []
    top = languages.most_common(4)
    parts = [(name, count) for name, count in top]
    if len(languages) > 4:
        parts.append(("Other", total - sum(count for _, count in top)))
    return [(name, count / total * 100, count) for name, count in parts]


def build_activity_svg(
    profile: dict | None,
    repos: list[dict],
    languages: Counter,
    current: dict | None,
    previous: dict | None,
) -> str:
    width, height = 1000, 360
    repo_count = profile.get("public_repos") if profile else (len(repos) or None)
    followers = profile.get("followers") if profile else None
    following = profile.get("following") if profile else None

    current_total = current.get("contributionCalendar", {}).get("totalContributions") if current else None
    previous_total = previous.get("contributionCalendar", {}).get("totalContributions") if previous else None
    commits = current.get("totalCommitContributions") if current else None
    pulls = current.get("totalPullRequestContributions") if current else None
    issues = current.get("totalIssueContributions") if current else None
    reviews = current.get("totalPullRequestReviewContributions") if current else None
    restricted = current.get("restrictedContributionsCount", 0) if current else 0

    current_streak, longest_streak = compute_streaks(calendar_days(current)) if current else (None, None)

    tiles = [
        (fmt_number(repo_count), "PUBLIC REPOS", VIOLET),
        (fmt_number(followers), "FOLLOWERS", INDIGO),
        (fmt_number(current_total), f"CONTRIBUTIONS {YEAR}", CYAN),
        (f"{current_streak}d" if current_streak is not None else "—", "CURRENT STREAK", LAVENDER),
        (f"{longest_streak}d" if longest_streak is not None else "—", "LONGEST STREAK", VIOLET),
        (fmt_number(commits), f"COMMITS {YEAR}", INDIGO),
    ]

    if current:
        subline = (
            f"FOLLOWING {fmt_number(following)} · PULL REQUESTS {fmt_number(pulls)} · "
            f"ISSUES {fmt_number(issues)} · REVIEWS {fmt_number(reviews)} · "
            f"{YEAR - 1}: {fmt_number(previous_total)} CONTRIBUTIONS"
        )
    else:
        subline = "CONTRIBUTION DATA UNAVAILABLE — THE WORKFLOW WILL RETRY ON THE NEXT RUN"

    footer = (
        f"INCLUDES {restricted} PRIVATE CONTRIBUTIONS · PUBLIC REPOSITORY STATS"
        if restricted
        else "PUBLIC DATA ONLY · PRIVATE CONTRIBUTIONS NOT INCLUDED"
    )

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="activityTitle activityDesc">',
        f'  <title id="activityTitle">GitHub activity and language mix for {USER}</title>',
        f'  <desc id="activityDesc">Repository count, followers, contributions, streaks, commits, pull requests, issues, reviews, and most-used languages from public GitHub data.</desc>',
        "  <defs>",
        '    <radialGradient id="panelGlow" cx="0.5" cy="0.5" r="0.5">',
        '      <stop offset="0" stop-color="#8B5CF6" stop-opacity="0.16"/>',
        '      <stop offset="1" stop-color="#8B5CF6" stop-opacity="0"/>',
        '    </radialGradient>',
        '    <linearGradient id="topRule" x1="0" y1="0" x2="1" y2="0">',
        '      <stop offset="0" stop-color="#8B5CF6" stop-opacity="0"/>',
        '      <stop offset="0.3" stop-color="#8B5CF6" stop-opacity="0.7"/>',
        '      <stop offset="0.7" stop-color="#22D3EE" stop-opacity="0.5"/>',
        '      <stop offset="1" stop-color="#22D3EE" stop-opacity="0"/>',
        '    </linearGradient>',
        '    <clipPath id="barClip">',
        '      <rect x="36" y="252" width="928" height="12" rx="6"/>',
        '    </clipPath>',
        "  </defs>",
        f'  <rect width="{width}" height="{height}" rx="14" fill="{BG}" stroke="{LINE}" stroke-width="1"/>',
        "  <ellipse cx=\"830\" cy=\"58\" rx=\"300\" ry=\"170\" fill=\"url(#panelGlow)\"/>",
        '  <line x1="24" y1="1" x2="976" y2="1" stroke="url(#topRule)" stroke-width="2"/>',
        svg_text(36, 44, "ACTIVITY & CONTRIBUTIONS", size=12, fill=INK, weight=600, family=FONT_MONO, letter_spacing=2.2),
        svg_text(36, 64, "PUBLIC GITHUB DATA · REFRESHED BY ACTIONS", size=9, fill=MUTED, family=FONT_MONO, opacity=0.7, letter_spacing=1.2),
        svg_text(964, 44, str(YEAR), size=12, fill=VIOLET, anchor="end", family=FONT_MONO, letter_spacing=2),
    ]

    tile_width = 144
    tile_gap = 12
    for index, (value, label, accent) in enumerate(tiles):
        x = 36 + index * (tile_width + tile_gap)
        parts.extend(
            [
                f'  <rect x="{x}" y="86" width="{tile_width}" height="88" rx="10" fill="{PANEL}" stroke="{LINE}" stroke-width="1"/>',
                svg_text(x + 16, 132, value, size=26, fill=INK, weight=700),
                svg_text(x + 16, 152, label, size=9, fill=MUTED, family=FONT_MONO, letter_spacing=1.1),
                f'  <rect x="{x + 16}" y="162" width="28" height="2" rx="1" fill="{accent}" fill-opacity="0.85"/>',
            ]
        )

    parts.append(svg_text(36, 200, subline, size=9.5, fill=MUTED, family=FONT_MONO, opacity=0.8, letter_spacing=0.6))

    parts.append(svg_text(36, 236, "LANGUAGE MIX", size=10.5, fill=INK, weight=600, family=FONT_MONO, letter_spacing=1.8))
    parts.append(svg_text(964, 236, "BY BYTES · ORIGINAL REPOSITORIES", size=8.5, fill=MUTED, anchor="end", family=FONT_MONO, opacity=0.65, letter_spacing=0.8))

    mix = language_mix(languages)
    if not mix:
        parts.extend(
            [
                f'  <rect x="36" y="252" width="928" height="12" rx="6" fill="{LINE}" fill-opacity="0.55"/>',
                svg_text(500, 262, "LANGUAGE DATA UNAVAILABLE", size=9, fill=MUTED, anchor="middle", family=FONT_MONO, letter_spacing=1.2),
            ]
        )
    else:
        bar_width = 928
        x_cursor = 36.0
        parts.append('  <g clip-path="url(#barClip)">')
        for index, (name, pct, _count) in enumerate(mix):
            if index == len(mix) - 1:
                segment_width = 964 - x_cursor
            else:
                segment_width = bar_width * pct / 100
            color = LANG_COLORS.get(name, FALLBACK_LANG_COLORS[index % len(FALLBACK_LANG_COLORS)])
            parts.append(
                f'    <rect x="{x_cursor:.2f}" y="252" width="{segment_width:.2f}" height="12" fill="{color}"/>'
            )
            x_cursor += segment_width
        parts.append("  </g>")

        for index, (name, pct, _count) in enumerate(mix):
            x = 36 + index * 185
            color = LANG_COLORS.get(name, FALLBACK_LANG_COLORS[index % len(FALLBACK_LANG_COLORS)])
            parts.append(f'  <circle cx="{x}" cy="286" r="3.2" fill="{color}"/>')
            label = name if len(name) <= 17 else name[:16] + "…"
            parts.append(svg_text(x + 10, 290, f"{label}  {pct:.0f}%", size=10, fill=MUTED, family=FONT_MONO))

    parts.append(svg_text(36, 334, footer, size=9, fill=MUTED, family=FONT_MONO, opacity=0.55, letter_spacing=0.6))
    parts.append("</svg>")
    return "\n".join(parts) + "\n"


def heat_level(count: int) -> int:
    if count <= 0:
        return 0
    if count == 1:
        return 1
    if count <= 3:
        return 2
    if count <= 6:
        return 3
    return 4


def build_heatmap_svg(current: dict, previous: dict | None) -> str:
    width, height = 1000, 230
    calendar = current.get("contributionCalendar", {})
    weeks = calendar.get("weeks", [])
    total = calendar.get("totalContributions", 0)
    restricted = current.get("restrictedContributionsCount", 0)

    counts: dict[str, int] = {}
    if previous:
        for day in calendar_days(previous):
            counts[day["date"]] = int(day.get("contributionCount", 0))
    for day in calendar_days(current):
        counts[day["date"]] = int(day.get("contributionCount", 0))

    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    x0, y0, step, cell = 68, 68, 17, 14

    footer = (
        f"INCLUDES {restricted} PRIVATE CONTRIBUTIONS · UTC"
        if restricted
        else "PUBLIC CONTRIBUTIONS · UTC"
    )

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="heatTitle heatDesc">',
        f'  <title id="heatTitle">Contribution calendar for {YEAR}</title>',
        f'  <desc id="heatDesc">{escape(str(total))} contributions in {YEAR}, shown as a dark calendar with a violet intensity scale.</desc>',
        "  <defs>",
        '    <linearGradient id="heatRule" x1="0" y1="0" x2="1" y2="0">',
        '      <stop offset="0" stop-color="#8B5CF6" stop-opacity="0.7"/>',
        '      <stop offset="0.65" stop-color="#6366F1" stop-opacity="0.35"/>',
        '      <stop offset="1" stop-color="#22D3EE" stop-opacity="0.45"/>',
        '    </linearGradient>',
        "  </defs>",
        f'  <rect width="{width}" height="{height}" rx="14" fill="{BG}" stroke="{LINE}" stroke-width="1"/>',
        '  <line x1="24" y1="1" x2="976" y2="1" stroke="url(#heatRule)" stroke-width="2"/>',
        svg_text(36, 38, f"CONTRIBUTION CALENDAR · {YEAR}", size=12, fill=INK, weight=600, family=FONT_MONO, letter_spacing=2.2),
        svg_text(964, 38, f"{fmt_number(total)} CONTRIBUTIONS", size=10, fill=VIOLET, anchor="end", family=FONT_MONO, letter_spacing=1.4),
    ]

    if not weeks:
        parts.extend(
            [
                svg_text(500, 112, "CONTRIBUTION DATA UNAVAILABLE", size=13, fill=INK, weight=600, anchor="middle", family=FONT_MONO, letter_spacing=1.6),
                svg_text(500, 136, "The workflow will retry on the next run.", size=10, fill=MUTED, anchor="middle", family=FONT_MONO),
                "</svg>",
            ]
        )
        return "\n".join(parts) + "\n"

    jan1 = date(YEAR, 1, 1)
    dec31 = date(YEAR, 12, 31)
    grid_start = jan1 - timedelta(days=(jan1.weekday() + 1) % 7)
    grid_end = dec31 + timedelta(days=(5 - dec31.weekday()) % 7)
    week_count = ((grid_end - grid_start).days + 1) // 7

    previous_month = None
    for week_index in range(week_count):
        week_start = grid_start + timedelta(days=week_index * 7)
        thursday = week_start + timedelta(days=3)
        if thursday.year == YEAR and thursday.month != previous_month:
            parts.append(
                svg_text(
                    x0 + week_index * step,
                    58,
                    month_names[thursday.month - 1],
                    size=9.5,
                    fill=MUTED,
                    family=FONT_MONO,
                    opacity=0.8,
                )
            )
            previous_month = thursday.month

        for row in range(7):
            day_date = week_start + timedelta(days=row)
            count = counts.get(day_date.isoformat(), 0)
            future = day_date > TODAY
            in_year = day_date.year == YEAR
            if future:
                fill, opacity = PANEL, 0.42
            elif not in_year:
                fill, opacity = PANEL, 0.55
            else:
                fill, opacity = HEAT[heat_level(count)], 1
            parts.append(
                f'  <rect x="{x0 + week_index * step}" y="{y0 + row * step}" width="{cell}" height="{cell}" rx="3" fill="{fill}" fill-opacity="{opacity}"/>'
            )

    for row, label in ((1, "Mon"), (3, "Wed"), (5, "Fri")):
        parts.append(
            svg_text(38, y0 + row * step + 11, label, size=9.5, fill=MUTED, family=FONT_MONO, opacity=0.75)
        )

    parts.append(svg_text(36, 212, footer, size=9, fill=MUTED, family=FONT_MONO, opacity=0.6, letter_spacing=0.6))
    parts.append(svg_text(814, 212, "LESS", size=9, fill=MUTED, anchor="end", family=FONT_MONO, opacity=0.7))
    for index, color in enumerate(HEAT):
        parts.append(f'  <rect x="{826 + index * 16}" y="201" width="12" height="12" rx="2.5" fill="{color}"/>')
    parts.append(svg_text(942, 212, "MORE", size=9, fill=MUTED, family=FONT_MONO, opacity=0.7))
    parts.append("</svg>")
    return "\n".join(parts) + "\n"


def build_heatmap_placeholder() -> str:
    return "\n".join(
        [
            '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="230" viewBox="0 0 1000 230" role="img" aria-labelledby="heatTitle">',
            f'  <title id="heatTitle">Contribution calendar for {YEAR}</title>',
            f'  <rect width="1000" height="230" rx="14" fill="{BG}" stroke="{LINE}" stroke-width="1"/>',
            svg_text(36, 38, f"CONTRIBUTION CALENDAR · {YEAR}", size=12, fill=INK, weight=600, family=FONT_MONO, letter_spacing=2.2),
            svg_text(500, 112, "CONTRIBUTION DATA UNAVAILABLE", size=13, fill=INK, weight=600, anchor="middle", family=FONT_MONO, letter_spacing=1.6),
            svg_text(500, 136, "The workflow will retry on the next run.", size=10, fill=MUTED, anchor="middle", family=FONT_MONO),
            "</svg>",
        ]
    ) + "\n"


PR_ACTIONS = {
    "opened": "Opened",
    "closed": "Closed",
    "reopened": "Reopened",
    "synchronize": "Updated",
}
ISSUE_ACTIONS = {
    "opened": "Opened",
    "closed": "Closed",
    "reopened": "Reopened",
    "edited": "Edited",
}
MD_SPECIAL = re.compile(r"([\\`*_{}\[\]()#+\-.!|<>])")


def md_text(value) -> str:
    return MD_SPECIAL.sub(r"\\\1", str(value))


def fmt_date(value: str) -> str:
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return "Recently"
    return parsed.strftime("%b %d") if parsed.year == YEAR else parsed.strftime("%b %d, %Y")


def format_event(event: dict) -> str | None:
    repo = event.get("repo", {}).get("name")
    if not repo:
        return None
    short_repo = repo.rsplit("/", 1)[-1]
    link = f"[{short_repo}](https://github.com/{repo})"
    payload = event.get("payload", {})
    when = fmt_date(event.get("created_at", ""))
    event_type = event.get("type")

    if event_type == "PushEvent":
        size = payload.get("size")
        branch = str(payload.get("ref", "")).replace("refs/heads/", "")
        if isinstance(size, int) and size > 0:
            where = f" to {branch}" if branch else ""
            return f"- **{when}** — Pushed {size} commit{'s' if size != 1 else ''}{where} in {link}"
        if branch:
            return f"- **{when}** — Pushed to {branch} in {link}"
        return f"- **{when}** — Updated {link}"
    if event_type == "PullRequestEvent":
        number = payload.get("pull_request", {}).get("number", "?")
        action = payload.get("action", "updated")
        if action == "closed" and payload.get("pull_request", {}).get("merged"):
            action = "merged"
        action = PR_ACTIONS.get(action, str(action).capitalize())
        return f"- **{when}** — {action} PR #{number} in {link}"
    if event_type == "IssuesEvent":
        number = payload.get("issue", {}).get("number", "?")
        action = ISSUE_ACTIONS.get(payload.get("action", "updated"), str(payload.get("action", "updated")).capitalize())
        return f"- **{when}** — {action} issue #{number} in {link}"
    if event_type == "PullRequestReviewEvent":
        number = payload.get("pull_request", {}).get("number", "?")
        return f"- **{when}** — Reviewed PR #{number} in {link}"
    if event_type == "IssueCommentEvent":
        number = payload.get("issue", {}).get("number", "?")
        return f"- **{when}** — Commented on issue #{number} in {link}"
    if event_type == "CreateEvent":
        ref_type = payload.get("ref_type")
        if ref_type == "repository":
            return f"- **{when}** — Created repository {link}"
        if ref_type in ("branch", "tag") and payload.get("ref"):
            return f"- **{when}** — Created {ref_type} {md_text(payload['ref'])} in {link}"
        return None
    if event_type == "ReleaseEvent":
        tag = payload.get("release", {}).get("tag_name")
        if tag:
            return f"- **{when}** — Published release {md_text(tag)} in {link}"
    return None


def render_activity_block(events: list[dict], repos: list[dict]) -> str:
    lines: list[str] = []
    seen: set[tuple] = set()
    for event in events:
        line = format_event(event)
        if not line:
            continue
        key = (event.get("type"), event.get("repo", {}).get("name"))
        if key in seen:
            continue
        seen.add(key)
        lines.append(line)
        if len(lines) >= 6:
            break

    if not lines:
        lines.append("<sub>No public events in the last 90 days.</sub>")

    recent = [repo for repo in repos if repo.get("name") and repo["name"] != USER][:4]
    if recent:
        updates = []
        for repo in recent:
            name = repo["name"]
            pushed = fmt_date(repo.get("pushed_at", ""))
            updates.append(f"[{name}](https://github.com/{USER}/{name}) · {pushed}")
        lines.append("")
        lines.append(f"<sub>Recently updated: {' · '.join(updates)}</sub>")

    return "\n".join(lines)


def update_readme(block: str) -> bool:
    if not README.exists():
        warn(f"README not found at {README}")
        return False
    text = README.read_text(encoding="utf-8")
    pattern = re.compile(r"(<!-- ACTIVITY:START -->)(.*?)(<!-- ACTIVITY:END -->)", re.S)
    if not pattern.search(text):
        warn("README activity markers were not found; skipping the activity block update.")
        return False
    replacement = f"<!-- ACTIVITY:START -->\n{block}\n<!-- ACTIVITY:END -->"
    updated = pattern.sub(lambda _match: replacement, text, count=1)
    return write_if_changed(README, updated)


def write_if_changed(path: Path, content: str) -> bool:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        try:
            if path.read_text(encoding="utf-8") == content:
                return False
        except UnicodeDecodeError:
            pass
    path.write_text(content, encoding="utf-8", newline="\n")
    return True


def main() -> int:
    if not TOKEN:
        warn(
            "No GitHub token found. Set PROFILE_TOKEN (preferred), GITHUB_TOKEN, or GH_TOKEN. "
            "Contribution data will be skipped."
        )

    profile = fetch_profile()
    repos = fetch_repos()
    languages = fetch_languages(repos) if repos else Counter()
    events = fetch_events()
    contributions = fetch_contributions()

    current = contributions.get("current") if contributions else None
    previous = contributions.get("previous") if contributions else None

    if profile is None and not repos and current is None:
        warn("No GitHub data could be fetched; leaving the existing profile files untouched.")
        return 1

    changed: list[str] = []

    if current is not None or not ACTIVITY_SVG.exists():
        activity = build_activity_svg(profile, repos, languages, current, previous)
        if write_if_changed(ACTIVITY_SVG, activity):
            changed.append(str(ACTIVITY_SVG.relative_to(ROOT)))
    else:
        warn("Contribution data unavailable; keeping the existing activity dashboard.")

    if current is not None:
        heatmap = build_heatmap_svg(current, previous)
        if write_if_changed(HEATMAP_SVG, heatmap):
            changed.append(str(HEATMAP_SVG.relative_to(ROOT)))
    elif not HEATMAP_SVG.exists():
        if write_if_changed(HEATMAP_SVG, build_heatmap_placeholder()):
            changed.append(str(HEATMAP_SVG.relative_to(ROOT)))
    else:
        warn("Contribution data unavailable; keeping the existing heatmap.")

    if events is not None:
        if update_readme(render_activity_block(events, repos)):
            changed.append("README.md")
    else:
        warn("Events data unavailable; keeping the existing recent-activity block.")

    if changed:
        print("Updated: " + ", ".join(changed))
    else:
        print("No changes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
