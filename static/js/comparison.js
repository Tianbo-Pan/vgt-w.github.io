const modelViewerComparison1 = document.querySelector("model-viewer#modelViewerComparison1");
const modelViewerComparison2 = document.querySelector("model-viewer#modelViewerComparison2");
const modelViewerComparison3 = document.querySelector("model-viewer#modelViewerComparison3");
// // Initialize the selection panel images
// $('#comparisonSelectionPanel .selectable-image').each((i, img) => {
//     img.src = `static/comparison/${img.getAttribute('name')}/image.jpg`;
// })


// Click an image to select the case

document.querySelectorAll('#thumbnail-comparison video').forEach(el => {
    el.addEventListener('click', () => {
        // Remove border from all elements
        document.querySelectorAll('#thumbnail-comparison video').forEach(element => {
            element.style.border = 'none';
        });
        
        // Add border to clicked element
        el.style.border = '6px solid #43a3f6';

        const name = el.getAttribute('name');
        console.log('Selected thumbnail name:', name);

        // Store the selected name as an attribute on the thumbnail-comparison container
        document.getElementById('thumbnail-comparison').setAttribute('data-selected-name', name);

        const meshPath1 = `resources/comparison/vgtw/${name}.glb`
        const meshPath2 = `resources/comparison/vggt/${name}.glb`
        const meshPath3 = `resources/comparison/easi3r/${name}.glb`

        modelViewerComparison1.src = meshPath1;
        modelViewerComparison1.cameraOrbit = "180deg auto auto";
        modelViewerComparison1.resetTurntableRotation(0);
        modelViewerComparison1.jumpCameraToGoal();
        modelViewerComparison2.src = meshPath2;
        modelViewerComparison2.cameraOrbit = "180deg auto auto";
        modelViewerComparison2.resetTurntableRotation(0);
        modelViewerComparison2.jumpCameraToGoal();
        modelViewerComparison3.src = meshPath3;
        modelViewerComparison3.cameraOrbit = "180deg auto auto";
        modelViewerComparison3.resetTurntableRotation(0);
        modelViewerComparison3.jumpCameraToGoal();

    });
});
