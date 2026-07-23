import { parseMarkdown } from './parser.js';

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

function render() {
  preview.innerHTML = parseMarkdown(editor.value);
}

editor.addEventListener('input', render);

// Initial render
render();
