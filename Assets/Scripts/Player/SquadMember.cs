using UnityEngine;

namespace BridgeBattle
{
    /// <summary>
    /// Individual squad member with movement and shooting capabilities
    /// </summary>
    [RequireComponent(typeof(Rigidbody))]
    public class SquadMember : MonoBehaviour
    {
        private SquadManager squadManager;
        private Rigidbody rb;
        private Animator animator;

        [Header("Settings")]
        public float maxSpeed = 5f;
        public Transform shootPoint;

        [Header("Visual")]
        public MeshRenderer bodyRenderer;
        public Color memberColor = Color.blue;

        private Vector3 velocity = Vector3.zero;

        public void Initialize(SquadManager manager)
        {
            squadManager = manager;
            rb = GetComponent<Rigidbody>();
            rb.constraints = RigidbodyConstraints.FreezeRotation | RigidbodyConstraints.FreezePositionY;
            rb.useGravity = false;

            animator = GetComponentInChildren<Animator>();

            if (shootPoint == null)
            {
                GameObject shootPointObj = new GameObject("ShootPoint");
                shootPointObj.transform.SetParent(transform);
                shootPointObj.transform.localPosition = new Vector3(0, 1f, 0.5f);
                shootPoint = shootPointObj.transform;
            }

            // Set running animation
            if (animator != null)
            {
                animator.SetBool("IsRunning", true);
            }

            // Set visual color
            if (bodyRenderer != null)
            {
                MaterialPropertyBlock props = new MaterialPropertyBlock();
                props.SetColor("_Color", memberColor);
                bodyRenderer.SetPropertyBlock(props);
            }
        }

        public void ApplyVelocity(Vector3 vel)
        {
            velocity = vel;

            // Clamp velocity
            if (velocity.magnitude > maxSpeed)
            {
                velocity = velocity.normalized * maxSpeed;
            }

            // Apply to rigidbody
            rb.velocity = new Vector3(velocity.x, 0, velocity.z);

            // Face movement direction
            if (velocity.magnitude > 0.1f)
            {
                Quaternion targetRotation = Quaternion.LookRotation(Vector3.forward);
                transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, Time.deltaTime * 10f);
            }
        }

        public void Shoot()
        {
            if (BulletPooler.Instance != null)
            {
                Vector3 spawnPos = shootPoint != null ? shootPoint.position : transform.position + Vector3.up;
                Color bulletColor = squadManager != null ? squadManager.GetBulletColor() : Color.yellow;

                BulletPooler.Instance.SpawnBullet(spawnPos, Vector3.forward, bulletColor);
            }
        }

        private void OnDestroy()
        {
            // Cleanup
        }
    }
}
