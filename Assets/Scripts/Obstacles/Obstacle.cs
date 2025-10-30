using UnityEngine;
using TMPro;

namespace BridgeBattle
{
    /// <summary>
    /// Destructible obstacle with HP display and particle effects
    /// Tire stacks with large visible HP (100-300)
    /// </summary>
    public class Obstacle : MonoBehaviour
    {
        [Header("Obstacle Settings")]
        public int maxHealth = 200;
        public int scoreValue = 10;

        [Header("Weapon Pickup")]
        public bool hasWeaponPickup = false;
        public GameObject weaponPickupPrefab;
        public Transform weaponPickupPoint;

        [Header("Visual")]
        public TextMeshPro healthText;
        public GameObject destructionParticlePrefab;
        public MeshRenderer[] renderers;

        private int currentHealth;
        private bool isDestroyed = false;

        private void Start()
        {
            currentHealth = maxHealth;
            UpdateHealthDisplay();

            // Spawn weapon pickup if needed
            if (hasWeaponPickup && weaponPickupPrefab != null && weaponPickupPoint != null)
            {
                Instantiate(weaponPickupPrefab, weaponPickupPoint.position, Quaternion.identity, transform);
            }
        }

        public void TakeDamage(int damage, Vector3 hitPoint)
        {
            if (isDestroyed) return;

            currentHealth -= damage;
            currentHealth = Mathf.Max(0, currentHealth);

            UpdateHealthDisplay();

            // Spawn damage number
            if (DamageNumberManager.Instance != null)
            {
                DamageNumberManager.Instance.SpawnDamageNumber(damage, hitPoint);
            }

            // Small hit effect
            if (healthText != null)
            {
                LeanTween.scale(healthText.gameObject, Vector3.one * 1.2f, 0.1f).setLoopPingPong(1);
            }

            // Check if destroyed
            if (currentHealth <= 0)
            {
                DestroyObstacle();
            }
        }

        void UpdateHealthDisplay()
        {
            if (healthText != null)
            {
                healthText.text = currentHealth.ToString();
                healthText.fontSize = 6f; // Large font for visibility

                // Color based on health percentage
                float healthPercent = (float)currentHealth / maxHealth;
                Color healthColor = Color.Lerp(Color.red, Color.white, healthPercent);
                healthText.color = healthColor;
            }
        }

        void DestroyObstacle()
        {
            if (isDestroyed) return;
            isDestroyed = true;

            // Add score
            if (GameManager.Instance != null)
            {
                GameManager.Instance.AddScore(scoreValue);
            }

            // Spawn destruction particles
            if (destructionParticlePrefab != null)
            {
                GameObject particles = Instantiate(destructionParticlePrefab, transform.position, Quaternion.identity);
                Destroy(particles, 3f);
            }
            else
            {
                // Create default particle effect
                CreateDefaultExplosion();
            }

            // Screen shake
            if (CameraController.Instance != null)
            {
                CameraController.Instance.Shake(0.2f, 0.3f);
            }

            // Destroy object
            Destroy(gameObject);
        }

        void CreateDefaultExplosion()
        {
            GameObject explosion = new GameObject("Explosion");
            explosion.transform.position = transform.position;

            ParticleSystem ps = explosion.AddComponent<ParticleSystem>();
            var main = ps.main;
            main.duration = 1f;
            main.startLifetime = 0.5f;
            main.startSpeed = 5f;
            main.startSize = 0.3f;
            main.startColor = new Color(1f, 0.5f, 0f);
            main.maxParticles = 50;

            var emission = ps.emission;
            emission.rateOverTime = 0;
            emission.SetBursts(new ParticleSystem.Burst[] { new ParticleSystem.Burst(0f, 50) });

            var shape = ps.shape;
            shape.shapeType = ParticleSystemShapeType.Sphere;
            shape.radius = 0.5f;

            ps.Play();
            Destroy(explosion, 2f);
        }
    }
}
