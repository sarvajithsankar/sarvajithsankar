/**
 * Terminal & Direct Communication Console (Section 8 & Contact)
 * - Interactive shell prompt with input
 * - Quick-action command chips
 * - Real contact routing & link dispatch
 */

(function () {
  'use strict';

  const terminalOutput = document.getElementById('terminal-output');
  const terminalInput = document.getElementById('terminal-cmd-input');
  const terminalForm = document.getElementById('terminal-form');

  const commands = {
    whoami: () => [
      'Sarvajith Sankar — AI Engineer & ML Systems Developer',
      'Dual-degree B.Tech CS @ VIT Vellore (2025-2029) × B.S. Data Science @ IIT Madras',
      'Currently: AI Engineering Intern @ Maveric Systems (Autonomous Research Agents)'
    ],
    links: () => [
      'GitHub:   <a class="terminal-link" href="https://github.com/sarvajithsankar" target="_blank" rel="noopener">https://github.com/sarvajithsankar</a>',
      'LinkedIn: <a class="terminal-link" href="https://linkedin.com/in/sarvajithsankar" target="_blank" rel="noopener">https://linkedin.com/in/sarvajithsankar</a>',
      'Email:    <a class="terminal-link" href="mailto:sarvajith2knot8@gmail.com">sarvajith2knot8@gmail.com</a>'
    ],
    stack: () => [
      'Languages:  Python, C++17, Java, SQL, Shell',
      'AI & ML:    LangGraph, LangChain, MCP, ChromaDB, PyTorch, Transformers, scikit-learn',
      'Backend:    FastAPI, Flask, Redis, PostgreSQL, Docker, Kubernetes'
    ],
    focus: () => [
      'Maveric Systems: LangGraph research agent with MCP tool calls (Tavily, Wikipedia, arXiv)',
      'TENET-AI: SSoC Season 5 defensive security middleware protecting LLM endpoints',
      'Sentinel-Vault: SIEM monitor in C++17 with AVL tree blacklist and RAID-1 vault storage'
    ],
    clear: () => {
      if (terminalOutput) terminalOutput.innerHTML = '';
      return [];
    },
    help: () => [
      'Available commands: whoami, links, stack, focus, clear, help'
    ]
  };

  function printLine(html, isPrompt = false) {
    if (!terminalOutput) return;
    const line = document.createElement('div');
    line.className = 'terminal-line';
    if (isPrompt) {
      line.innerHTML = `<span class="terminal-prompt">$</span> <span class="terminal-cmd">${html}</span>`;
    } else {
      line.innerHTML = `<span class="terminal-out">${html}</span>`;
    }
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  window.runTerminalCommand = function (cmdStr) {
    const cleanCmd = cmdStr.trim().toLowerCase();
    printLine(cleanCmd, true);

    if (commands[cleanCmd]) {
      const outputLines = commands[cleanCmd]();
      outputLines.forEach(l => printLine(l));
    } else {
      printLine(`command not found: ${cleanCmd}. Type <span class="terminal-prompt">help</span> for options.`);
    }
  };

  if (terminalForm && terminalInput) {
    terminalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = terminalInput.value;
      if (val) {
        window.runTerminalCommand(val);
        terminalInput.value = '';
      }
    });
  }

  // Quick Action Chips in Terminal
  document.querySelectorAll('.terminal-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const cmd = chip.dataset.cmd;
      if (cmd) {
        window.runTerminalCommand(cmd);
      }
    });
  });

})();
