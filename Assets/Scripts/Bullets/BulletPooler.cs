using System.Collections.Generic;
using UnityEngine;

namespace BridgeBattle
{
    /// <summary>
    /// Efficient bullet pooling system - single script manages all bullets for performance
    /// Handles bullet lifecycle, movement, and collision detection
    /// </summary>
    public class BulletPooler : MonoBehaviour
    {
        public static BulletPooler Instance { get; private set; }

        [Header("Bullet Settings")]
        public GameObject bulletPrefab;
        public int poolSize = 100;
        public float bulletSpeed = 20f;
        public float bulletLifetime = 3f;
        public int bulletDamage = 10;

        [Header("Visual Effects")]
        public GameObject bulletTrailPrefab;
        public float trailLifetime = 0.5f;

        private Queue<GameObject> bulletPool = new Queue<GameObject>();
        private List<ActiveBullet> activeBullets = new List<ActiveBullet>();

        private class ActiveBullet
        {
            public GameObject gameObject;
            public Vector3 direction;
            public float lifetime;
            public TrailRenderer trail;
            public MeshRenderer renderer;
        }

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

            InitializePool();
        }

        void InitializePool()
        {
            // Create bullet pool
            for (int i = 0; i < poolSize; i++)
            {
                GameObject bullet = CreateBullet();
                bullet.SetActive(false);
                bulletPool.Enqueue(bullet);
            }
        }

        GameObject CreateBullet()
        {
            GameObject bullet;

            if (bulletPrefab != null)
            {
                bullet = Instantiate(bulletPrefab, transform);
            }
            else
            {
                // Create default bullet
                bullet = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                bullet.transform.localScale = Vector3.one * 0.15f;
                bullet.transform.SetParent(transform);

                // Remove collider (we'll use raycast)
                Collider col = bullet.GetComponent<Collider>();
                if (col != null) Destroy(col);

                // Add glow material
                MeshRenderer renderer = bullet.GetComponent<MeshRenderer>();
                Material mat = new Material(Shader.Find("Standard"));
                mat.SetColor("_Color", Color.yellow);
                mat.SetColor("_EmissionColor", Color.yellow);
                mat.EnableKeyword("_EMISSION");
                renderer.material = mat;

                // Add trail
                TrailRenderer trail = bullet.AddComponent<TrailRenderer>();
                trail.time = trailLifetime;
                trail.startWidth = 0.1f;
                trail.endWidth = 0.02f;
                trail.material = mat;
            }

            return bullet;
        }

        public void SpawnBullet(Vector3 position, Vector3 direction, Color color)
        {
            GameObject bullet;

            if (bulletPool.Count > 0)
            {
                bullet = bulletPool.Dequeue();
            }
            else
            {
                // Pool exhausted, create new bullet
                bullet = CreateBullet();
            }

            bullet.transform.position = position;
            bullet.SetActive(true);

            // Set color
            MeshRenderer renderer = bullet.GetComponent<MeshRenderer>();
            if (renderer != null)
            {
                MaterialPropertyBlock props = new MaterialPropertyBlock();
                props.SetColor("_Color", color);
                props.SetColor("_EmissionColor", color * 2f);
                renderer.SetPropertyBlock(props);
            }

            // Set trail color
            TrailRenderer trail = bullet.GetComponent<TrailRenderer>();
            if (trail != null)
            {
                trail.Clear();
                Gradient gradient = new Gradient();
                gradient.SetKeys(
                    new GradientColorKey[] { new GradientColorKey(color, 0f), new GradientColorKey(color, 1f) },
                    new GradientAlphaKey[] { new GradientAlphaKey(1f, 0f), new GradientAlphaKey(0f, 1f) }
                );
                trail.colorGradient = gradient;
            }

            // Add to active bullets
            ActiveBullet activeBullet = new ActiveBullet
            {
                gameObject = bullet,
                direction = direction.normalized,
                lifetime = 0f,
                trail = trail,
                renderer = renderer
            };

            activeBullets.Add(activeBullet);
        }

        private void Update()
        {
            // Update all active bullets in a single loop (performance optimization)
            for (int i = activeBullets.Count - 1; i >= 0; i--)
            {
                ActiveBullet bullet = activeBullets[i];
                bullet.lifetime += Time.deltaTime;

                // Check lifetime
                if (bullet.lifetime >= bulletLifetime)
                {
                    ReturnBullet(bullet, i);
                    continue;
                }

                // Move bullet
                Vector3 movement = bullet.direction * bulletSpeed * Time.deltaTime;
                Vector3 currentPos = bullet.gameObject.transform.position;
                Vector3 nextPos = currentPos + movement;

                // Raycast for collision
                RaycastHit hit;
                if (Physics.Raycast(currentPos, bullet.direction, out hit, movement.magnitude))
                {
                    // Hit something
                    HandleBulletHit(hit, bullet);
                    ReturnBullet(bullet, i);
                }
                else
                {
                    // Move to next position
                    bullet.gameObject.transform.position = nextPos;
                }
            }
        }

        void HandleBulletHit(RaycastHit hit, ActiveBullet bullet)
        {
            // Check what was hit
            Obstacle obstacle = hit.collider.GetComponent<Obstacle>();
            if (obstacle != null)
            {
                obstacle.TakeDamage(bulletDamage, hit.point);
                return;
            }

            Gate gate = hit.collider.GetComponent<Gate>();
            if (gate != null)
            {
                gate.OnShot();
                return;
            }

            Enemy enemy = hit.collider.GetComponent<Enemy>();
            if (enemy != null)
            {
                enemy.TakeDamage(bulletDamage, hit.point);
                return;
            }
        }

        void ReturnBullet(ActiveBullet bullet, int index)
        {
            bullet.gameObject.SetActive(false);
            bulletPool.Enqueue(bullet.gameObject);
            activeBullets.RemoveAt(index);
        }
    }
}
