# Brain Visualization App - Manual Test Guide

## 🧪 Test Steps

### 1. Start the Development Server
```bash
npm run dev
```
Server should start at http://localhost:5173/

### 2. Open in Browser
Navigate to: http://localhost:5173/

### 3. Expected Results

#### ✅ Visual Elements You Should See:
1. **Dark background** (color: #0a0a0a)
2. **Pink semi-transparent brain sphere** in the center
3. **Blue marker sphere** (smaller, positioned at -10, 5, 2)
4. **Rotation animation** - the brain should be slowly rotating

#### ✅ Interactions to Test:
1. **Click anywhere on the canvas**
   - Open browser console (F12 → Console tab)
   - You should see: `Brain clicked at: [x], [y]`

2. **Resize the window**
   - The 3D scene should resize accordingly
   - Brain should stay centered

#### ✅ Console Checks:
1. No error messages in console
2. Click events logging coordinates

### 4. Technical Verification

Open Developer Tools (F12) and check:
- **Elements tab**: Should see a `<canvas>` element
- **Console tab**: No red errors
- **Network tab**: All resources loaded (main.jsx, etc.)

### 5. Screenshot What You Should See

```
+------------------------------------------+
|                                          |
|     [Pink rotating brain sphere]         |
|              with                        |
|        [Small blue sphere]               |
|                                          |
|     (Dark background #0a0a0a)           |
|                                          |
+------------------------------------------+
```

## 🔧 Troubleshooting

If you don't see the 3D visualization:
1. Check browser console for errors
2. Ensure WebGL is enabled in your browser
3. Try refreshing the page (Ctrl/Cmd + R)
4. Check that port 5173 is not blocked

## 📸 Taking a Screenshot

For verification:
1. Take a screenshot of the running app
2. It should show the pink brain sphere with blue marker
3. Console should show click coordinates when clicked