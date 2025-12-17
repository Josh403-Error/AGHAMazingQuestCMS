import React, { useState, useRef } from 'react';

const RichTextEditor = ({ value, onChange, placeholder, id, name }) => {
  const textareaRef = useRef(null);
  const [text, setText] = useState(value || '');

  const handleChange = (e) => {
    const newValue = e.target.value;
    setText(newValue);
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: newValue
        }
      });
    }
  };

  const insertTextAtCursor = (textToInsert) => {
    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const newText = text.substring(0, startPos) + textToInsert + text.substring(endPos);
    setText(newText);
    
    // Update cursor position
    setTimeout(() => {
      textarea.selectionStart = startPos + textToInsert.length;
      textarea.selectionEnd = startPos + textToInsert.length;
      textarea.focus();
    }, 0);
    
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: newText
        }
      });
    }
  };

  const formatText = (command, value = null) => {
    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const selectedText = text.substring(startPos, endPos);
    
    let formattedText = selectedText;
    
    switch (command) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `_${selectedText}_`;
        break;
      case 'bulletList':
        formattedText = `\n• ${selectedText.split('\n').join('\n• ')}`;
        break;
      case 'numberedList':
        const lines = selectedText.split('\n');
        formattedText = '\n' + lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
        break;
      default:
        break;
    }
    
    const newText = text.substring(0, startPos) + formattedText + text.substring(endPos);
    setText(newText);
    
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: newText
        }
      });
    }
    
    // Keep selection
    setTimeout(() => {
      textarea.selectionStart = startPos;
      textarea.selectionEnd = startPos + formattedText.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button 
          type="button" 
          onClick={() => formatText('bold')}
          title="Bold"
          className="toolbar-button"
        >
          <b>B</b>
        </button>
        <button 
          type="button" 
          onClick={() => formatText('italic')}
          title="Italic"
          className="toolbar-button"
        >
          <i>I</i>
        </button>
        <button 
          type="button" 
          onClick={() => formatText('underline')}
          title="Underline"
          className="toolbar-button"
        >
          <u>U</u>
        </button>
        <div className="toolbar-divider"></div>
        <button 
          type="button" 
          onClick={() => formatText('bulletList')}
          title="Bullet List"
          className="toolbar-button"
        >
          <span className="material-icons" aria-hidden="true">format_list_bulleted</span>
        </button>
        <button 
          type="button" 
          onClick={() => formatText('numberedList')}
          title="Numbered List"
          className="toolbar-button"
        >
          <span className="material-icons" aria-hidden="true">format_list_numbered</span>
        </button>
        <div className="toolbar-divider"></div>
        <button 
          type="button" 
          onClick={() => insertTextAtCursor('### Heading\n')}
          title="Heading"
          className="toolbar-button"
        >
          <span className="material-icons" aria-hidden="true">title</span>
        </button>
        <button 
          type="button" 
          onClick={() => insertTextAtCursor('---\n')}
          title="Horizontal Rule"
          className="toolbar-button"
        >
          <span className="material-icons" aria-hidden="true">horizontal_rule</span>
        </button>
      </div>
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        value={text}
        onChange={handleChange}
        rows="8"
        placeholder={placeholder}
        className="editor-content"
      ></textarea>
    </div>
  );
};

export default RichTextEditor;