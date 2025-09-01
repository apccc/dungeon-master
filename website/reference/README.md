# Reference Form

The reference form is a read-only data viewer that displays complex nested objects and arrays in an organized, easy-to-navigate format.

## Features

- **Read-only Display**: All data is displayed in a read-only format for reference purposes
- **Recursive Traversal**: Automatically handles nested objects and arrays of any depth
- **Collapsible Sections**: Arrays and objects can be expanded or collapsed for easier navigation
- **Type-aware Rendering**: Different data types are displayed with appropriate styling and formatting
- **Responsive Design**: Works well on desktop and mobile devices
- **XSS Protection**: All user data is properly escaped to prevent security issues

## Data Type Support

The reference form supports all JavaScript data types:

- **Strings**: Displayed in green with quotes
- **Numbers**: Displayed in orange
- **Booleans**: Displayed in pink and bold
- **Null/Undefined**: Displayed in gray and italicized
- **Arrays**: Displayed with item count and collapsible content
- **Objects**: Displayed with property count and collapsible content
- **Empty Collections**: Arrays and objects with no items are clearly marked

## Usage

### Basic Usage

```javascript
// Load reference data from API
loadApiController('reference', 'middle', 'Reference', buildReferenceForm);

// Or call directly with data
buildReferenceForm('containerId', data, 'Title', 'apiPath');
```

### Custom Data Display

```javascript
const myData = {
    name: "Example",
    settings: {
        enabled: true,
        count: 42,
        items: ["a", "b", "c"]
    }
};

buildReferenceForm('my-container', myData, 'My Data', 'custom');
```

## Styling

The reference form includes built-in CSS that provides:

- Clean, monospace font for data display
- Color-coded values by type
- Hover effects on interactive elements
- Responsive design for mobile devices
- Consistent spacing and indentation

## API Integration

The reference form integrates with the existing API system:

- Uses `loadApiController()` for standard API data loading
- Handles different response formats (`settings.data` or direct data)
- Compatible with existing authentication and error handling

## File Structure

- `reference.js` - Main JavaScript implementation
- `index.html` - Reference page template
- `test.html` - Test page with sample data
- `README.md` - This documentation file

## Browser Compatibility

- Modern browsers with ES6+ support
- Responsive design for mobile devices
- Graceful degradation for older browsers
