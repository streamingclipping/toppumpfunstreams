# PumpFun Livestream Web App

A modern, responsive web application for displaying and managing PumpFun livestreams with real-time data fetching capabilities.

## Features

- 🔍 **Search & Filter**: Search through streams by title, description, or tags
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 🔄 **Auto-refresh**: Automatically updates data every 30 seconds
- 🎯 **Smart Filtering**: Filter by "All", "Trending", or "New" streams
- 📊 **Live Statistics**: View real-time viewer counts and engagement metrics
- 🏷️ **Tag System**: Organize streams with custom tags
- 📄 **Pagination**: Navigate through large datasets efficiently

## Project Structure

```
pumpfunlivestream/
├── index.html          # Main HTML file
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality and API integration
└── README.md           # This file
```

## Getting Started

1. **Clone or download** this repository to your local machine
2. **Open** `index.html` in your web browser
3. **Start developing** by modifying the files as needed

## API Integration

The app currently uses mock data for demonstration purposes. To integrate with a real PumpFun API:

1. **Replace the mock data** in `script.js`:
   ```javascript
   // Replace this function
   async fetchMockData() {
       // Your API call here
       const response = await fetch('YOUR_API_ENDPOINT');
       return await response.json();
   }
   ```

2. **Update the data structure** to match your API response format

3. **Add error handling** for network issues and API rate limits

## Customization

### Styling
- Modify `styles.css` to change colors, fonts, and layout
- The app uses CSS Grid for responsive design
- Color scheme can be easily changed by updating CSS variables

### Functionality
- Add new filters in the `setActiveFilter()` method
- Modify the `createStreamCard()` method to change how streams are displayed
- Update the auto-refresh interval in `setupAutoRefresh()`

### Data Structure
The app expects stream objects with this structure:
```javascript
{
    id: number,
    title: string,
    description: string,
    viewers: number,
    likes: number,
    status: "live" | "offline",
    tags: string[],
    thumbnail: string (optional)
}
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

To extend the app:

1. **Add new features** by modifying the `PumpFunApp` class
2. **Create new components** by adding methods to the class
3. **Integrate real APIs** by replacing the mock data functions
4. **Add tests** by creating a separate test file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
