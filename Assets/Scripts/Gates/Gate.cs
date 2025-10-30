using UnityEngine;
using TMPro;

namespace BridgeBattle
{
    /// <summary>
    /// Gate system that spans full width of bridge - cannot be avoided
    /// Modifies squad size through arithmetic (additive or subtractive)
    /// Can be shot to increase positive values
    /// </summary>
    public class Gate : MonoBehaviour
    {
        [Header("Gate Settings")]
        public int gateValue = 5; // Positive = add, Negative = subtract
        public bool canBeShot = true;
        public int valueIncreasePerShot = 1;
        public float maxShotValue = 20f;

        [Header("Visual")]
        public TextMeshPro valueText;
        public MeshRenderer gateRenderer;
        public Material positiveMaterial; // Blue
        public Material negativeMaterial; // Red

        [Header("Holographic Effect")]
        public float pulseSpeed = 2f;
        public float pulseAmount = 0.3f;

        private bool hasBeenTriggered = false;
        private float pulseTimer = 0f;
        private int currentValue;

        private void Start()
        {
            currentValue = gateValue;
            UpdateVisuals();
        }

        private void Update()
        {
            // Holographic pulse effect
            pulseTimer += Time.deltaTime * pulseSpeed;
            float pulse = 1f + Mathf.Sin(pulseTimer) * pulseAmount;

            if (gateRenderer != null)
            {
                MaterialPropertyBlock props = new MaterialPropertyBlock();
                props.SetFloat("_Intensity", pulse);
                gateRenderer.SetPropertyBlock(props);
            }

            // Scale pulse
            if (valueText != null)
            {
                valueText.transform.localScale = Vector3.one * pulse;
            }
        }

        void UpdateVisuals()
        {
            // Update text
            if (valueText != null)
            {
                string prefix = currentValue > 0 ? "+" : "";
                valueText.text = prefix + currentValue.ToString();
                valueText.fontSize = 8f; // Large text for visibility
            }

            // Update material color
            if (gateRenderer != null)
            {
                Material matToUse = currentValue > 0 ? positiveMaterial : negativeMaterial;

                if (matToUse != null)
                {
                    gateRenderer.material = matToUse;
                }
                else
                {
                    // Set default colors
                    MaterialPropertyBlock props = new MaterialPropertyBlock();
                    Color baseColor = currentValue > 0 ? new Color(0.2f, 0.5f, 1f, 0.6f) : new Color(1f, 0.2f, 0.2f, 0.6f);
                    props.SetColor("_Color", baseColor);
                    gateRenderer.SetPropertyBlock(props);
                }
            }
        }

        public void OnShot()
        {
            if (!canBeShot || hasBeenTriggered) return;

            // Increase value if positive gate
            if (currentValue > 0 && currentValue < maxShotValue)
            {
                currentValue += valueIncreasePerShot;
                UpdateVisuals();

                // Visual feedback
                if (valueText != null)
                {
                    LeanTween.scale(valueText.gameObject, Vector3.one * 1.5f, 0.1f).setLoopPingPong(1);
                }
            }
        }

        private void OnTriggerEnter(Collider other)
        {
            if (hasBeenTriggered) return;

            // Check if squad entered
            SquadManager squad = other.GetComponentInParent<SquadManager>();
            if (squad != null)
            {
                hasBeenTriggered = true;
                ApplyGateEffect(squad);
            }
        }

        void ApplyGateEffect(SquadManager squad)
        {
            // Modify squad size
            squad.ModifySquadSize(currentValue);

            // Visual feedback
            if (valueText != null)
            {
                // Scale up and fade out
                LeanTween.scale(valueText.gameObject, Vector3.one * 3f, 0.5f);
                LeanTween.alpha(valueText.gameObject, 0f, 0.5f);
            }

            // Pulse effect
            if (gateRenderer != null)
            {
                LeanTween.alpha(gateRenderer.gameObject, 0f, 0.5f);
            }

            // Destroy gate after effect
            Destroy(gameObject, 0.6f);
        }
    }
}
