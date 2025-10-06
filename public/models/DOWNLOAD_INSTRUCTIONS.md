# Brain Model Download Instructions

## Required File: brain-labeled.glb

### Option 1: Sketchfab (Recommended - Fast Implementation)

1. **Go to**: https://sketchfab.com/3d-models/brain-with-labeled-parts-28c8971e11334e8b97a2a0d6235992e8

2. **Download**:
   - Click "Download 3D Model" button (requires free Sketchfab account)
   - Select **GLB** format
   - Download will be named something like `brain-with-labeled-parts.glb`

3. **Rename and Place**:
   ```bash
   mv ~/Downloads/brain-with-labeled-parts.glb ./public/models/brain-labeled.glb
   ```

4. **Verify**:
   - File size should be ~20-25 MB
   - File should be at: `/public/models/brain-labeled.glb`

### Option 2: BigBrain (Scientific Accuracy - Requires Conversion)

If you need highest scientific accuracy:

1. **Download OBJ files**:
   - URL: https://bigbrain-ftp.loris.ca/bigbrain-ftp/BigBrainRelease.2015/3D_Surfaces/Apr7_2016/wavefront-obj/
   - Get: `gray_left_327680_2009b_sym.obj` (~23 MB)
   - Get: `gray_right_327680_2009b_sym.obj` (~23 MB)

2. **Convert to GLB**:
   ```bash
   # Using obj2gltf
   npx obj2gltf -i gray_left_327680_2009b_sym.obj -o brain_left.glb
   npx obj2gltf -i gray_right_327680_2009b_sym.obj -o brain_right.glb

   # Or use Blender:
   # File > Import > Wavefront (.obj)
   # File > Export > glTF 2.0 (.glb)
   ```

3. **Merge or use separately** (code will need modification for two-file approach)

## License Attribution Required

### For Sketchfab Model:
Add to your project:
```
Brain 3D model: "Brain with labeled parts" by AbdulMuhaymin
Source: Sketchfab (https://sketchfab.com/3d-models/brain-with-labeled-parts-28c8971e11334e8b97a2a0d6235992e8)
License: Creative Commons Attribution (CC-BY)
```

### For BigBrain Model:
```
Brain mesh: BigBrain Project
Source: EBRAINS Human Brain Project
URL: https://bigbrain-ftp.loris.ca
License: Open access for research and education
```

## Testing the Download

Once downloaded, verify the file:

```bash
# Check file exists and size
ls -lh public/models/brain-labeled.glb

# Expected output: ~20-25 MB for Sketchfab, ~40-50 MB for BigBrain

# Start development server
npm run dev

# Check browser console for loading messages
# Should see: "Loading brain mesh: 100%"
```

## Troubleshooting

**File not loading:**
- Check file path is exactly `/public/models/brain-labeled.glb`
- Verify file isn't corrupted (re-download if needed)
- Check browser console for CORS or 404 errors

**File too large (slow loading):**
- Try Sketchfab version first (smaller, faster)
- Enable compression in Vite config
- Consider implementing progressive loading

**Can't download from Sketchfab:**
- Create free account (required for downloads)
- Alternative: Use NIH 3D models and convert STL to GLB
- Or request file from project maintainer
