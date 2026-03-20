const DEFAULT_CAMERA_ORBIT = "180deg 70deg auto";
const FIRST_FRAME_BACKOFF_SCALE_DEFAULT = 5;
const FIRST_FRAME_BACKOFF_SCALE_EASI3R = 2;
const FIRST_FRAME_MIN_RADIUS_SCENE_SCALE = 0.8;
const presetCache = new Map();

function getFirstFrameBackoffScale(glbSrc) {
  if (typeof glbSrc === "string" && /\/easi3r\//i.test(glbSrc)) {
    return FIRST_FRAME_BACKOFF_SCALE_EASI3R;
  }
  return FIRST_FRAME_BACKOFF_SCALE_DEFAULT;
}

function adjustFirstFramePreset(preset, glbSrc) {
  if (!preset || preset.source !== "first_frame_camera" || typeof preset.camera_orbit !== "string") {
    return preset;
  }

  const parts = preset.camera_orbit.trim().split(/\s+/);
  if (parts.length !== 3 || !parts[2].endsWith("m")) {
    return preset;
  }

  const radius = Number.parseFloat(parts[2].slice(0, -1));
  if (!Number.isFinite(radius)) {
    return preset;
  }

  const sceneScale = Number.isFinite(preset.scene_scale) ? Number(preset.scene_scale) : 0;
  const backoffScale = getFirstFrameBackoffScale(glbSrc);
  const adjustedRadius = Math.max(
    radius * backoffScale,
    sceneScale * FIRST_FRAME_MIN_RADIUS_SCENE_SCALE
  );

  return {
    ...preset,
    original_camera_orbit: preset.camera_orbit,
    camera_orbit: `${parts[0]} ${parts[1]} ${adjustedRadius.toFixed(6)}m`,
    backoff_scale: backoffScale,
    min_radius_scene_scale: FIRST_FRAME_MIN_RADIUS_SCENE_SCALE,
  };
}

async function loadViewerPreset(glbSrc) {
  if (!glbSrc) return null;
  if (presetCache.has(glbSrc)) {
    return presetCache.get(glbSrc);
  }

  const viewerJsonSrc = glbSrc.replace(/\.glb$/i, ".viewer.json");
  const presetPromise = fetch(viewerJsonSrc, { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) return null;
      return response.json();
    })
    .then((preset) => adjustFirstFramePreset(preset, glbSrc))
    .catch(() => null);

  presetCache.set(glbSrc, presetPromise);
  return presetPromise;
}

function applyViewerPreset(viewer, preset) {
  if (!viewer) return;

  viewer.cameraOrbit = preset && preset.camera_orbit ? preset.camera_orbit : DEFAULT_CAMERA_ORBIT;
  viewer.cameraTarget = preset && preset.camera_target ? preset.camera_target : "auto auto auto";
  viewer.fieldOfView = preset && preset.field_of_view ? preset.field_of_view : "auto";

  if (typeof viewer.resetTurntableRotation === "function") {
    viewer.resetTurntableRotation(0);
  }
  if (typeof viewer.jumpCameraToGoal === "function") {
    viewer.jumpCameraToGoal();
  }
}

async function setViewerSource(viewer, glbSrc) {
  if (!viewer || !glbSrc) return;

  const presetPromise = loadViewerPreset(glbSrc);
  const applyWhenLoaded = async () => {
    viewer.removeEventListener("load", applyWhenLoaded);
    const preset = await presetPromise;
    applyViewerPreset(viewer, preset);
  };

  viewer.addEventListener("load", applyWhenLoaded);
  viewer.setAttribute("src", glbSrc);
}

function updateThumbnailSelection(activeThumbnail) {
  document.querySelectorAll("#thumbnail-comparison video").forEach((element) => {
    element.classList.remove("thumbnail-selected");
    if (element !== activeThumbnail) {
      element.pause();
      element.currentTime = 0;
    }
  });

  if (!activeThumbnail) return;
  activeThumbnail.classList.add("thumbnail-selected");
  activeThumbnail.play().catch(() => {});
}

function getComparisonViewers() {
  return [
    document.getElementById("modelViewerComparison1"),
    document.getElementById("modelViewerComparison2"),
    document.getElementById("modelViewerComparison3"),
  ];
}

function setComparisonScene(name) {
  const [viewer1, viewer2, viewer3] = getComparisonViewers();
  if (!viewer1 || !viewer2 || !viewer3) return;

  document.getElementById("thumbnail-comparison")?.setAttribute("data-selected-name", name);

  setViewerSource(viewer1, `resources/comparison/vgtw/${name}.glb`);
  setViewerSource(viewer2, `resources/comparison/vggt/${name}.glb`);
  setViewerSource(viewer3, `resources/comparison/easi3r/${name}.glb`);
}

function initComparisonViewers() {
  const thumbnails = Array.from(document.querySelectorAll("#thumbnail-comparison video"));
  if (thumbnails.length === 0) return;

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", () => {
      const name = thumbnail.getAttribute("name");
      if (!name) return;
      updateThumbnailSelection(thumbnail);
      setComparisonScene(name);
    });
  });

  const initialThumbnail =
    thumbnails.find((thumbnail) => thumbnail.getAttribute("name") === "corner") ?? thumbnails[0];
  updateThumbnailSelection(initialThumbnail);
  const initialName = initialThumbnail.getAttribute("name");
  if (initialName) {
    setComparisonScene(initialName);
  }
}

window.initComparisonViewers = initComparisonViewers;

document.addEventListener("DOMContentLoaded", () => {
  initComparisonViewers();
});
