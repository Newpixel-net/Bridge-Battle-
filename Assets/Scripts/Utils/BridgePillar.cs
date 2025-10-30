using UnityEngine;

namespace BridgeBattle
{
    /// <summary>
    /// Creates and manages bridge pillars (Golden Gate style)
    /// Red vertical supports along the sides of the bridge
    /// </summary>
    public class BridgePillar : MonoBehaviour
    {
        [Header("Pillar Settings")]
        public float pillarHeight = 20f;
        public float pillarSpacing = 30f;
        public float bridgeWidth = 40f;
        public Material pillarMaterial;

        [Header("Generation")]
        public int pillarsPerSide = 10;
        public bool generateOnStart = true;

        private void Start()
        {
            if (generateOnStart)
            {
                GeneratePillars();
            }
        }

        public void GeneratePillars()
        {
            // Generate pillars on both sides
            for (int i = 0; i < pillarsPerSide; i++)
            {
                float zPos = i * pillarSpacing;

                // Left side pillar
                CreatePillar(new Vector3(-bridgeWidth / 2f, pillarHeight / 2f, zPos));

                // Right side pillar
                CreatePillar(new Vector3(bridgeWidth / 2f, pillarHeight / 2f, zPos));
            }
        }

        void CreatePillar(Vector3 position)
        {
            // Main vertical support
            GameObject pillar = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            pillar.transform.SetParent(transform);
            pillar.transform.position = position;
            pillar.transform.localScale = new Vector3(0.8f, pillarHeight / 2f, 0.8f);
            pillar.name = "Pillar";

            MeshRenderer renderer = pillar.GetComponent<MeshRenderer>();
            if (pillarMaterial != null)
            {
                renderer.material = pillarMaterial;
            }
            else
            {
                Material mat = new Material(Shader.Find("Standard"));
                mat.color = new Color(0.8f, 0.15f, 0.15f); // Red
                renderer.material = mat;
            }

            // Add cross beams
            CreateCrossBeam(position, 0);
            CreateCrossBeam(position, pillarHeight / 3f);
            CreateCrossBeam(position, pillarHeight * 2f / 3f);
        }

        void CreateCrossBeam(Vector3 pillarPos, float heightOffset)
        {
            GameObject beam = GameObject.CreatePrimitive(PrimitiveType.Cube);
            beam.transform.SetParent(transform);
            beam.transform.position = pillarPos + Vector3.up * heightOffset;
            beam.transform.localScale = new Vector3(3f, 0.3f, 0.3f);
            beam.name = "CrossBeam";

            MeshRenderer renderer = beam.GetComponent<MeshRenderer>();
            if (pillarMaterial != null)
            {
                renderer.material = pillarMaterial;
            }
            else
            {
                Material mat = new Material(Shader.Find("Standard"));
                mat.color = new Color(0.8f, 0.15f, 0.15f);
                renderer.material = mat;
            }
        }
    }
}
