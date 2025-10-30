using UnityEngine;

namespace BridgeBattle
{
    /// <summary>
    /// Glowing weapon pickup on top of obstacles
    /// Rotates and provides visual feedback when collected
    /// </summary>
    public class WeaponPickup : MonoBehaviour
    {
        [Header("Settings")]
        public int weaponType = 1; // Different weapon types
        public float rotationSpeed = 90f;
        public float bobSpeed = 2f;
        public float bobHeight = 0.3f;

        [Header("Visual")]
        public Color glowColor = Color.cyan;
        public MeshRenderer weaponRenderer;
        public Light glowLight;

        private Vector3 startPosition;
        private bool isCollected = false;

        private void Start()
        {
            startPosition = transform.position;

            // Setup glow
            if (weaponRenderer != null)
            {
                Material mat = weaponRenderer.material;
                mat.EnableKeyword("_EMISSION");
                mat.SetColor("_EmissionColor", glowColor * 2f);
            }

            // Add light if not present
            if (glowLight == null)
            {
                GameObject lightObj = new GameObject("GlowLight");
                lightObj.transform.SetParent(transform);
                lightObj.transform.localPosition = Vector3.zero;

                glowLight = lightObj.AddComponent<Light>();
                glowLight.type = LightType.Point;
                glowLight.color = glowColor;
                glowLight.intensity = 2f;
                glowLight.range = 5f;
            }
        }

        private void Update()
        {
            if (isCollected) return;

            // Rotate
            transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime);

            // Bob up and down
            float bobOffset = Mathf.Sin(Time.time * bobSpeed) * bobHeight;
            transform.position = startPosition + Vector3.up * bobOffset;

            // Pulse light
            if (glowLight != null)
            {
                glowLight.intensity = 2f + Mathf.Sin(Time.time * bobSpeed) * 0.5f;
            }
        }

        private void OnTriggerEnter(Collider other)
        {
            if (isCollected) return;

            SquadMember member = other.GetComponent<SquadMember>();
            if (member != null)
            {
                Collect();
            }
        }

        void Collect()
        {
            isCollected = true;

            // Apply weapon effect to squad
            SquadManager squad = FindObjectOfType<SquadManager>();
            if (squad != null)
            {
                // For now, just add squad members as a bonus
                squad.ModifySquadSize(weaponType * 2);
            }

            // Enlargement effect
            LeanTween.scale(gameObject, Vector3.one * 2f, 0.3f).setEase(LeanTweenType.easeOutBack);
            LeanTween.alpha(gameObject, 0f, 0.3f).setDelay(0.2f);

            // Particle effect
            CreateCollectionEffect();

            // Destroy after animation
            Destroy(gameObject, 0.6f);
        }

        void CreateCollectionEffect()
        {
            GameObject effect = new GameObject("CollectionEffect");
            effect.transform.position = transform.position;

            ParticleSystem ps = effect.AddComponent<ParticleSystem>();
            var main = ps.main;
            main.duration = 1f;
            main.startLifetime = 0.8f;
            main.startSpeed = 3f;
            main.startSize = 0.3f;
            main.startColor = glowColor;
            main.maxParticles = 30;

            var emission = ps.emission;
            emission.rateOverTime = 0;
            emission.SetBursts(new ParticleSystem.Burst[] { new ParticleSystem.Burst(0f, 30) });

            var shape = ps.shape;
            shape.shapeType = ParticleSystemShapeType.Sphere;
            shape.radius = 0.5f;

            ps.Play();
            Destroy(effect, 2f);
        }
    }
}
