/**
 * Custom Quill module for handling slash commands
 */

class SlashCommands {
  quill: any;
  options: any;
  onSlashCommand: (range: any) => void;

  constructor(quill: any, options: any) {
    this.quill = quill;
    this.options = options;
    this.onSlashCommand = options.onSlashCommand || (() => {});

    // Register keyboard bindings
    this.registerBindings();

    // Listen for text changes to detect slash commands
    this.quill.on('text-change', this.handleTextChange.bind(this));
  }

  registerBindings() {
    // Add keyboard binding for slash key
    this.quill.keyboard.addBinding({
      key: '/',
      handler: this.handleSlashKey.bind(this)
    });
  }

  handleSlashKey(range: any) {
    // Call the onSlashCommand callback with the current range
    this.onSlashCommand(range);
    
    // Delete the slash character that was just typed
    this.quill.deleteText(range.index, 1, 'user');
    
    // Return true to prevent default handling
    return true;
  }

  handleTextChange(delta: any, oldContents: any, source: string) {
    // Only process user input
    if (source !== 'user') return;
    
    // Check if the last character typed was a slash
    if (delta.ops && delta.ops.some((op: any) => 
      typeof op.insert === 'string' && op.insert === '/'
    )) {
      // Get the current selection
      const selection = this.quill.getSelection();
      if (selection) {
        // Call the onSlashCommand callback with the current selection
        this.onSlashCommand(selection);
        
        // Delete the slash character
        this.quill.deleteText(selection.index - 1, 1, 'user');
      }
    }
  }
}

// Register the module with Quill
function registerSlashCommands(Quill: any) {
  Quill.register('modules/slashCommands', SlashCommands);
}

export { SlashCommands, registerSlashCommands };
