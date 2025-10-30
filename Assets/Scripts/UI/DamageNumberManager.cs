using System.Collections.Generic;
using UnityEngine;
using TMPro;

namespace BridgeBattle
{
    /// <summary>
    /// Manages floating damage numbers that pop up and float away
    /// Large, golden text that floats upward
    /// </summary>
    public class DamageNumberManager : MonoBehaviour
    {
        public static DamageNumberManager Instance { get; private set; }

        [Header("Settings")]
        public GameObject damageNumberPrefab;
        public int poolSize = 50;
        public float floatSpeed = 2f;
        public float lifetime = 1f;
        public float fontSize = 4f;
        public Color damageColor = new Color(1f, 0.84f, 0f); // Golden

        private Queue<GameObject> numberPool = new Queue<GameObject>();
        private List<ActiveDamageNumber> activeNumbers = new List<ActiveDamageNumber>();

        private class ActiveDamageNumber
        {
            public GameObject gameObject;
            public TextMeshPro text;
            public float lifetime;
            public Vector3 velocity;
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
            for (int i = 0; i < poolSize; i++)
            {
                GameObject numberObj = CreateDamageNumber();
                numberObj.SetActive(false);
                numberPool.Enqueue(numberObj);
            }
        }

        GameObject CreateDamageNumber()
        {
            GameObject numberObj;

            if (damageNumberPrefab != null)
            {
                numberObj = Instantiate(damageNumberPrefab, transform);
            }
            else
            {
                // Create default damage number
                numberObj = new GameObject("DamageNumber");
                numberObj.transform.SetParent(transform);

                TextMeshPro textMesh = numberObj.AddComponent<TextMeshPro>();
                textMesh.fontSize = fontSize;
                textMesh.color = damageColor;
                textMesh.alignment = TextAlignmentOptions.Center;
                textMesh.fontStyle = FontStyles.Bold;

                // Outline for visibility
                textMesh.outlineWidth = 0.2f;
                textMesh.outlineColor = Color.black;
            }

            return numberObj;
        }

        public void SpawnDamageNumber(int damage, Vector3 position)
        {
            GameObject numberObj;

            if (numberPool.Count > 0)
            {
                numberObj = numberPool.Dequeue();
            }
            else
            {
                numberObj = CreateDamageNumber();
            }

            numberObj.transform.position = position + Vector3.up * 0.5f;
            numberObj.SetActive(true);

            TextMeshPro textMesh = numberObj.GetComponent<TextMeshPro>();
            if (textMesh != null)
            {
                textMesh.text = damage.ToString();
                textMesh.color = damageColor;
                textMesh.alpha = 1f;
            }

            // Random horizontal spread
            Vector3 randomVelocity = new Vector3(
                Random.Range(-0.5f, 0.5f),
                floatSpeed,
                Random.Range(-0.5f, 0.5f)
            );

            ActiveDamageNumber activeNumber = new ActiveDamageNumber
            {
                gameObject = numberObj,
                text = textMesh,
                lifetime = 0f,
                velocity = randomVelocity
            };

            activeNumbers.Add(activeNumber);
        }

        private void Update()
        {
            for (int i = activeNumbers.Count - 1; i >= 0; i--)
            {
                ActiveDamageNumber number = activeNumbers[i];
                number.lifetime += Time.deltaTime;

                if (number.lifetime >= lifetime)
                {
                    ReturnNumber(number, i);
                    continue;
                }

                // Float upward
                number.gameObject.transform.position += number.velocity * Time.deltaTime;

                // Fade out
                if (number.text != null)
                {
                    float alpha = 1f - (number.lifetime / lifetime);
                    number.text.alpha = alpha;
                }

                // Face camera
                if (Camera.main != null)
                {
                    number.gameObject.transform.LookAt(Camera.main.transform);
                    number.gameObject.transform.Rotate(0, 180, 0);
                }
            }
        }

        void ReturnNumber(ActiveDamageNumber number, int index)
        {
            number.gameObject.SetActive(false);
            numberPool.Enqueue(number.gameObject);
            activeNumbers.RemoveAt(index);
        }
    }
}
