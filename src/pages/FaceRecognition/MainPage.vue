<template>
  <q-page>
    <div class="text-h4 text-center q-mt-lg">Sim-Swap Face Detection</div>
    <div class="flex flex-center">
      <div class="q-pa-md" style="position: relative;">
        <!-- Display video and canvas only if video is active -->
        <video v-if="showVideo" ref="video" width="640" height="480" autoplay muted></video>
        <canvas v-if="showVideo" ref="canvas" width="640" height="480"
          style="position: absolute; top: 0; left: 0;"></canvas>
      </div>

      <!-- Display the snapshot image when available and video is hidden -->
      <q-img v-if="snapshot && !showVideo" :src="snapshot" class="q-mt-md" style="width: 100%; max-width: 640px;" />
    </div>

    <div class="flex flex-center q-mt-md">
      <div class="flex flex-start">
        <!-- File picker instead of uploader -->

        <div class="q-ml-md">
          <q-file
          v-model="pickedFile"
          color="secondary"
          filled
          label="Select an image"
          style="max-width: 300px"
        >
          <template v-slot:prepend>
            <q-icon name="cloud_upload" />
          </template>
        </q-file>
          <div class="q-mt-md">
            Status: {{ status }}
          </div>
          <div>
            {{isTheSamePerson}}
          </div>
          <div class="q-mt-md">
            Upload Status: {{ uploadStatus }}
          </div>
          <!-- Show "Start Camera" if camera hasn't been started yet -->
          <q-btn v-if="!videoActive && !snapshot" class="q-mt-md" unelevated label="Start Camera" @click="startVideo"
            color="dark" />
          <!-- Show Capture Picture button when face detection is in green condition and video is active -->
          <q-btn v-if="showCaptureButton && showVideo" class="q-mt-md" unelevated label="Capture Picture" @click="capturePhoto"
            color="secondary" />
          <q-btn v-if="snapshot && !showVideo" class="q-mt-md" unelevated label="Restart Video" @click="restartVideo"
            color="dark" />
          <q-btn
            v-if="snapshot && pickedFile"
            class="q-mt-md q-ml-md"
            label="Submit"
            unelevated
            color="secondary"
            @click="submitImages"

          />
          <div style="height: 30px;"></div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'

import * as faceapi from 'face-api.js'
import { compareFaces } from 'src/boot/editorCloudFunctions';

export default {
  setup() {
    const video = ref(null)
    const canvas = ref(null)
    const status = ref('Waiting for camera...')
    const snapshot = ref(null)
    const showCaptureButton = ref(false) // Controls capture button visibility
    const showVideo = ref(true) // Controls video (and canvas) display
    const videoActive = ref(false) // Indicates if the camera stream is active
    const pickedFile = ref(null) // Holds the file selected via the file picker
    const uploadStatus = ref('')  // Displays status of the upload/compare request
    const isTheSamePerson = ref("")
    let intervalId = null

    // Load face-api models
    async function loadModels() {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
    }

    // Perform face detection and draw bounding box on the canvas
    async function detectFace() {
      if (!video.value || !canvas.value) return

      const detections = await faceapi.detectSingleFace(
        video.value,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks()

      const ctx = canvas.value.getContext('2d')
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

      let isGreenCondition = false

      if (detections && detections.landmarks) {
        const box = detections.detection.box

        if (box.width < 190) {
          status.value = 'Please come closer'
          ctx.strokeStyle = '#FF0000'
          ctx.lineWidth = 2
          ctx.strokeRect(box.x, box.y, box.width, box.height)
        } else if (box.width > 200 && box.width < 250) {
          isGreenCondition = true
          ctx.strokeStyle = '#00FF00'
          ctx.lineWidth = 2
          ctx.strokeRect(box.x, box.y, box.width, box.height)
        } else if (box.width > 250) {
          isGreenCondition = true
          ctx.strokeStyle = '#00FF00'
          ctx.lineWidth = 2
          ctx.strokeRect(box.x, box.y, box.width, box.height)
        } else if (box.width > 150 && box.width < 200) {
          isGreenCondition = true
          ctx.strokeStyle = '#00FF00'
          ctx.lineWidth = 2
          ctx.strokeRect(box.x, box.y, box.width, box.height)
        }

        // Toggle the capture button only in green condition
        showCaptureButton.value = isGreenCondition

        // Face orientation check (simplified calculations)
        const landmarks = detections.landmarks
        const nose = landmarks.getNose()
        const leftEye = landmarks.getLeftEye()
        const rightEye = landmarks.getRightEye()

        const pitch = calculatePitch(nose, leftEye, rightEye)
        const yaw = calculateYaw(nose, leftEye, rightEye)
        const roll = calculateRoll(leftEye, rightEye)

        const isFacingFront = Math.abs(pitch) < 10 && Math.abs(yaw) < 10 && Math.abs(roll) < 10
        status.value = isFacingFront ? 'Looking good! ✅' : 'Please face the camera directly ❌'
      } else {
        status.value = 'No face detected'
        showCaptureButton.value = false
      }
    }

    // Capture photo, hide video and canvas, and display snapshot
    function capturePhoto() {
      const tempCanvas = document.createElement('canvas')
      const videoElement = video.value

      tempCanvas.width = videoElement.videoWidth
      tempCanvas.height = videoElement.videoHeight

      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.save()
      tempCtx.scale(-1, 1)
      tempCtx.drawImage(videoElement, -tempCanvas.width, 0, tempCanvas.width, tempCanvas.height)
      tempCtx.restore()

      snapshot.value = tempCanvas.toDataURL('image/png')
      // Hide video and canvas and stop face detection
      showVideo.value = false
      showCaptureButton.value = false
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    // Restart video display and resume face detection
    function restartVideo() {
      snapshot.value = null
      showVideo.value = true
      status.value = 'Resuming camera...'
      // Restart face detection if the camera stream is still active
      if (video.value && video.value.srcObject) {
        intervalId = setInterval(detectFace, 100)
      } else {
        startVideo()
      }
    }

    // Helper functions to calculate pitch, yaw, and roll
    function calculatePitch(nose, leftEye, rightEye) {
      return (nose[0].y - (leftEye[0].y + rightEye[0].y) / 2) * 0.1
    }

    function calculateYaw(nose, leftEye, rightEye) {
      return (nose[0].x - (leftEye[0].x + rightEye[0].x) / 2) * 0.1
    }

    function calculateRoll(leftEye, rightEye) {
      return (leftEye[0].y - rightEye[0].y) * 0.1
    }

    // Start the camera stream and begin face detection
    async function startVideo() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
        video.value.srcObject = stream
        videoActive.value = true
        showVideo.value = true
        snapshot.value = null
        status.value = 'Camera started - Detecting...'
        intervalId = setInterval(detectFace, 100)
      } catch (err) {
        status.value = 'Error accessing camera'
        console.error(err)
      }
    }

    // Helper to convert a dataURL to a Blob
    function dataURLtoBlob(dataurl) {
      const arr = dataurl.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    }

    // Submit both images to the server (using the global compareFaces function)
    async function submitImages() {
      if (!snapshot.value) {
        uploadStatus.value = "No snapshot available!"
        return
      }
      if (!pickedFile.value) {
        uploadStatus.value = "Please select an image!"
        return
      }
      uploadStatus.value = "Uploading images..."

      try {
        // Convert the snapshot (data URL) into a File object
        const blob = dataURLtoBlob(snapshot.value)
        const fileSnapshot = new File([blob], "snapshot.png", { type: blob.type })

        // Access the global compareFaces function from boot

        // Call compareFaces with the two images
        const response = await compareFaces({
          image1: fileSnapshot,
          image2: pickedFile.value
        })
        uploadStatus.value = "The Similarity score is " + JSON.stringify(response.similarity_score * 100 ?? "")
        if ( response.similarity_score ) {
          isTheSamePerson.value = response.similarity_score * 100 > 60 ? "The same person" : "Its not the same person"
        }

      } catch (error) {
        console.error('Error submitting images:', error)
        uploadStatus.value = "Upload failed."
      }
    }

    onMounted(() => {
      loadModels().then(() => {
        status.value = 'Models loaded - Click start camera'
      })
    })

    onBeforeUnmount(() => {
      if (intervalId) clearInterval(intervalId)
      if (video.value && video.value.srcObject) {
        video.value.srcObject.getTracks().forEach(track => track.stop())
      }
    })

    return {
      video,
      canvas,
      status,
      snapshot,
      showCaptureButton,
      showVideo,
      videoActive,
      pickedFile,
      uploadStatus,
      startVideo,
      capturePhoto,
      restartVideo,
      submitImages,
      isTheSamePerson
    }
  }
}
</script>

<style>
video,
canvas {
  border-radius: 10px;
}

canvas {
  pointer-events: none;
}
</style>
