using UnityEngine;

namespace BridgeBattle
{
    /// <summary>
    /// Smooth camera follow with screen shake effects
    /// Positioned close to action (8-10 units back, 8 units up)
    /// </summary>
    public class CameraController : MonoBehaviour
    {
        public static CameraController Instance { get; private set; }

        [Header("Follow Settings")]
        public Transform target;
        public Vector3 offset = new Vector3(0, 8f, -10f);
        public float smoothSpeed = 10f;

        [Header("Camera Settings")]
        public float fieldOfView = 60f;

        [Header("Screen Shake")]
        public float shakeDecay = 2f;

        private Vector3 shakeOffset = Vector3.zero;
        private float currentShakeIntensity = 0f;
        private float shakeDuration = 0f;
        private Camera cam;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
            }
            else
            {
                Destroy(gameObject);
                return;
            }

            cam = GetComponent<Camera>();
            if (cam != null)
            {
                cam.fieldOfView = fieldOfView;
            }
        }

        private void LateUpdate()
        {
            if (target == null) return;

            // Calculate desired position
            Vector3 desiredPosition = target.position + offset;

            // Apply shake
            if (shakeDuration > 0)
            {
                shakeDuration -= Time.deltaTime;
                shakeOffset = Random.insideUnitSphere * currentShakeIntensity;
                currentShakeIntensity = Mathf.Lerp(currentShakeIntensity, 0f, Time.deltaTime * shakeDecay);
            }
            else
            {
                shakeOffset = Vector3.zero;
            }

            // Smooth follow
            Vector3 smoothedPosition = Vector3.Lerp(transform.position, desiredPosition + shakeOffset, smoothSpeed * Time.deltaTime);
            transform.position = smoothedPosition;

            // Always look at target
            transform.LookAt(target.position + Vector3.up * 2f);
        }

        public void Shake(float intensity, float duration)
        {
            currentShakeIntensity = intensity;
            shakeDuration = duration;
        }

        public void SetTarget(Transform newTarget)
        {
            target = newTarget;
        }
    }
}
