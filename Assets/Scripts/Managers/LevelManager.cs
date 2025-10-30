using System.Collections.Generic;
using UnityEngine;

namespace BridgeBattle
{
    /// <summary>
    /// Procedural level generation system
    /// Creates bridge segments with gates, obstacles, and enemies
    /// Long levels (1000+ units) with progressive difficulty
    /// </summary>
    public class LevelManager : MonoBehaviour
    {
        [Header("Level Settings")]
        public float segmentLength = 100f;
        public int initialSegments = 3;
        public float despawnDistance = 50f;

        [Header("Bridge")]
        public GameObject bridgeSegmentPrefab;
        public float bridgeWidth = 40f;

        [Header("Obstacles")]
        public GameObject[] obstaclePrefabs;
        public int minObstaclesPerSegment = 2;
        public int maxObstaclesPerSegment = 5;
        public float obstacleSpacing = 20f;

        [Header("Gates")]
        public GameObject gatePrefab;
        public int gatesPerSegment = 1;
        public float gateSpacing = 40f;

        [Header("Enemies")]
        public GameObject enemyPrefab;
        public int minEnemiesPerSegment = 3;
        public int maxEnemiesPerSegment = 8;

        [Header("Difficulty")]
        public float difficultyIncrease = 0.1f;
        public int maxGateValue = 10;

        private List<GameObject> activeSegments = new List<GameObject>();
        private float nextSegmentZ = 0f;
        private Transform playerTransform;
        private int segmentCount = 0;

        private void Start()
        {
            // Find player
            SquadManager squad = FindObjectOfType<SquadManager>();
            if (squad != null)
            {
                playerTransform = squad.transform;
            }

            // Generate initial segments
            for (int i = 0; i < initialSegments; i++)
            {
                GenerateNextSegment();
            }
        }

        private void Update()
        {
            if (playerTransform == null) return;

            // Generate new segments as player progresses
            if (playerTransform.position.z > nextSegmentZ - segmentLength * 2)
            {
                GenerateNextSegment();
            }

            // Despawn old segments
            DespawnOldSegments();
        }

        public void GenerateNextSegment()
        {
            GameObject segment = new GameObject($"Segment_{segmentCount}");
            segment.transform.position = new Vector3(0, 0, nextSegmentZ);
            segment.transform.SetParent(transform);

            // Create bridge
            CreateBridge(segment.transform);

            // Add obstacles
            CreateObstacles(segment.transform);

            // Add gates
            CreateGates(segment.transform);

            // Add enemies
            CreateEnemies(segment.transform);

            activeSegments.Add(segment);
            nextSegmentZ += segmentLength;
            segmentCount++;
        }

        void CreateBridge(Transform parent)
        {
            if (bridgeSegmentPrefab != null)
            {
                GameObject bridge = Instantiate(bridgeSegmentPrefab, parent);
                bridge.transform.localPosition = Vector3.zero;
                bridge.transform.localScale = new Vector3(bridgeWidth / 10f, 1f, segmentLength / 10f);
            }
            else
            {
                // Create default bridge segment
                GameObject bridge = GameObject.CreatePrimitive(PrimitiveType.Cube);
                bridge.transform.SetParent(parent);
                bridge.transform.localPosition = new Vector3(0, -0.5f, segmentLength / 2);
                bridge.transform.localScale = new Vector3(bridgeWidth, 1f, segmentLength);
                bridge.name = "BridgeRoad";

                // Set material
                MeshRenderer renderer = bridge.GetComponent<MeshRenderer>();
                Material mat = new Material(Shader.Find("Standard"));
                mat.color = new Color(0.5f, 0.5f, 0.5f);
                renderer.material = mat;

                // Add collider
                BoxCollider collider = bridge.GetComponent<BoxCollider>();
                if (collider == null)
                    collider = bridge.AddComponent<BoxCollider>();
            }
        }

        void CreateObstacles(Transform parent)
        {
            if (obstaclePrefabs == null || obstaclePrefabs.Length == 0) return;

            int obstacleCount = Random.Range(minObstaclesPerSegment, maxObstaclesPerSegment + 1);

            for (int i = 0; i < obstacleCount; i++)
            {
                float zPos = Random.Range(10f, segmentLength - 10f);
                float xPos = Random.Range(-bridgeWidth / 3f, bridgeWidth / 3f);

                GameObject obstaclePrefab = obstaclePrefabs[Random.Range(0, obstaclePrefabs.Length)];
                GameObject obstacle = Instantiate(obstaclePrefab, parent);
                obstacle.transform.localPosition = new Vector3(xPos, 0, zPos);

                // Increase difficulty
                Obstacle obstacleScript = obstacle.GetComponent<Obstacle>();
                if (obstacleScript != null)
                {
                    obstacleScript.maxHealth = Mathf.RoundToInt(obstacleScript.maxHealth * (1 + segmentCount * difficultyIncrease));
                }
            }
        }

        void CreateGates(Transform parent)
        {
            if (gatePrefab == null) return;

            for (int i = 0; i < gatesPerSegment; i++)
            {
                float zPos = (i + 1) * gateSpacing;
                if (zPos > segmentLength - 10f) break;

                GameObject gate = Instantiate(gatePrefab, parent);
                gate.transform.localPosition = new Vector3(0, 1f, zPos);

                // Random gate value
                int value = Random.Range(-maxGateValue, maxGateValue + 1);
                if (value == 0) value = Random.Range(1, 5); // Avoid zero

                Gate gateScript = gate.GetComponent<Gate>();
                if (gateScript != null)
                {
                    gateScript.gateValue = value;
                }
            }
        }

        void CreateEnemies(Transform parent)
        {
            if (enemyPrefab == null) return;

            int enemyCount = Random.Range(minEnemiesPerSegment, maxEnemiesPerSegment + 1);

            for (int i = 0; i < enemyCount; i++)
            {
                float zPos = Random.Range(20f, segmentLength - 20f);
                float xPos = Random.Range(-bridgeWidth / 2.5f, bridgeWidth / 2.5f);

                GameObject enemy = Instantiate(enemyPrefab, parent);
                enemy.transform.localPosition = new Vector3(xPos, 0, zPos);
            }
        }

        void DespawnOldSegments()
        {
            if (playerTransform == null) return;

            for (int i = activeSegments.Count - 1; i >= 0; i--)
            {
                GameObject segment = activeSegments[i];
                if (segment != null)
                {
                    float distance = playerTransform.position.z - segment.transform.position.z;
                    if (distance > despawnDistance + segmentLength)
                    {
                        activeSegments.RemoveAt(i);
                        Destroy(segment);
                    }
                }
                else
                {
                    activeSegments.RemoveAt(i);
                }
            }
        }
    }
}
