const formatCommand = (command) => {
  // Handle quotes properly by splitting on spaces while preserving quoted strings
  const parts = command.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g) || [];
  let formattedParts = [];

  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];

    // Remove enclosing quotes but remember they existed
    const hasQuotes = part.startsWith('"') && part.endsWith('"');
    if (hasQuotes) {
      part = part.slice(1, -1);
    }

    if (part.startsWith("-") || part.startsWith("/")) {
      // Parameter (red) - handle both "-" and "/" styles
      formattedParts.push({
        text: part,
        color: "#cf222e", // GitHub light red
      });
    } else if (i === 0) {
      // Main command - handle PowerShell Verb-Noun format and regular commands
      const cmdletParts = part.split("-");
      if (cmdletParts.length > 1) {
        // Join with a non-breaking hyphen for cmdlets
        formattedParts.push({
          text: cmdletParts.join("‑"),
          color: "#0550ae", // GitHub light blue
        });
      } else {
        formattedParts.push({
          text: part,
          color: "#0550ae",
        });
      }
    } else if (parts[i - 1]?.startsWith("-") || parts[i - 1]?.startsWith("/")) {
      // Parameter value (purple) - for both parameter styles
      formattedParts.push({
        text: hasQuotes ? `"${part}"` : part,
        color: "#8250df", // GitHub light purple
      });
    } else {
      // Handle positional parameters or subcommands
      formattedParts.push({
        text: hasQuotes ? `"${part}"` : part,
        color: "#0550ae",
      });
    }
  }
  return formattedParts;
};

const generateHtml = (command) => {
  const formattedParts = formatCommand(command);
  const spans = formattedParts
    .map(
      ({ text, color }) =>
        `<span style="color: ${color}" unselectable="on">${text}</span>`
    )
    .join(" ");

  return `<div style="background-color: #ffffff; padding: 15px; border: 1px solid #d0d7de; font-family: Consolas, 'Courier New', monospace; font-size: 16px; color: #24292f; border-radius: 6px;" unselectable="on">
    <div style="font-size: 16px;" unselectable="on">${spans}</div>
</div>`;
};

const updatePreview = () => {
  const command = document.getElementById("commandInput").value;
  const html = generateHtml(command);
  document.getElementById("preview").innerHTML = html;
  document.getElementById("output").textContent = html;
};

const copyHtml = async () => {
  const command = document.getElementById("commandInput").value;
  const html = generateHtml(command);
  await navigator.clipboard.writeText(html);
  showCopySuccess("Copy HTML");
};

const showCopySuccess = () => {
  const targetButton = document.getElementById("copyHtmlBtn");
  if (targetButton) {
    const originalText = targetButton.textContent.trim();
    targetButton.textContent = "Copied!";
    targetButton.classList.add("success");
    setTimeout(() => {
      targetButton.textContent = originalText;
      targetButton.classList.remove("success");
    }, 2000);
  }
};

// Initial update
updatePreview();

// Update on input change
document
  .getElementById("commandInput")
  .addEventListener("input", updatePreview);
