using UnityEngine;

namespace BridgeBattle
{
    /// <summary>
    /// Enemy character that can be destroyed by player bullets
    /// </summary>
    public class Enemy : MonoBehaviour
    {
        [Header("Enemy Settings")]
        public int maxHealth = 50;
        public int scoreValue = 15;
        public float moveSpeed = 2f;
        public bool isStationary = false;

        [Header("Visual")]
        public MeshRenderer bodyRenderer;
        public Color enemyColor = Color.red;

        private int currentHealth;
        private bool isDestroyed = false;
        private Animator animator;

        private void Start()
        {
            currentHealth = maxHealth;
            animator = GetComponentInChildren<Animator>();

            // Set enemy color
            if (bodyRenderer != null)
            {
                MaterialPropertyBlock props = new MaterialPropertyBlock();
                props.SetColor("_Color", enemyColor);
                bodyRenderer.SetPropertyBlock(props);
            }

            // Set running animation
            if (animator != null && !isStationary)
            {
                animator.SetBool("IsRunning", true);
            }
        }

        private void Update()
        {
            if (!isStationary && !isDestroyed)
            {
                // Simple AI - move toward player
                transform.position += Vector3.back * moveSpeed * Time.deltaTime;
            }
        }

        public void TakeDamage(int damage, Vector3 hitPoint)
        {
            if (isDestroyed) return;

            currentHealth -= damage;

            // Spawn damage number
            if (DamageNumberManager.Instance != null)
            {
                DamageNumberManager.Instance.SpawnDamageNumber(damage, hitPoint);
            }

            if (currentHealth <= 0)
            {
                DestroyEnemy();
            }
        }

        void DestroyEnemy()
        {
            if (isDestroyed) return;
            isDestroyed = true;

            // Add score
            if (GameManager.Instance != null)
            {
                GameManager.Instance.AddScore(scoreValue);
            }

            // Particle effect
            CreateDeathEffect();

            // Destroy
            Destroy(gameObject);
        }

        void CreateDeathEffect()
        {
            GameObject explosion = new GameObject("EnemyExplosion");
            explosion.transform.position = transform.position;

            ParticleSystem ps = explosion.AddComponent<ParticleSystem>();
            var main = ps.main;
            main.duration = 1f;
            main.startLifetime = 0.5f;
            main.startSpeed = 3f;
            main.startSize = 0.2f;
            main.startColor = enemyColor;
            main.maxParticles = 30;

            var emission = ps.emission;
            emission.rateOverTime = 0;
            emission.SetBursts(new ParticleSystem.Burst[] { new ParticleSystem.Burst(0f, 30) });

            ps.Play();
            Destroy(explosion, 2f);
        }
    }
}
