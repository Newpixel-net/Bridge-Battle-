using System.Collections.Generic;
using UnityEngine;

namespace BridgeBattle
{
    /// <summary>
    /// Manages the player's squad formation, movement, and shooting
    /// Uses blob formation with separation forces for tight grouping
    /// </summary>
    public class SquadManager : MonoBehaviour
    {
        [Header("Squad Settings")]
        public int initialSquadSize = 5;
        public int currentSquadSize = 5;
        public float formationRadius = 3f;
        public float separationForce = 2f;
        public float cohesionForce = 1.5f;
        public float maxSpeed = 5f;

        [Header("Movement")]
        public float horizontalSpeed = 8f;
        public float verticalSpeed = 5f;
        public float movementBoundaryX = 15f; // Half of bridge width

        [Header("Prefabs")]
        public GameObject squadMemberPrefab;

        [Header("Shooting")]
        public float shootInterval = 0.33f; // ~3 bullets per second

        private List<SquadMember> squadMembers = new List<SquadMember>();
        private Vector3 targetPosition;
        private float shootTimer = 0f;

        private void Start()
        {
            targetPosition = transform.position;
            InitializeSquad(initialSquadSize);
        }

        private void Update()
        {
            HandleInput();
            UpdateFormation();
            HandleShooting();
            UpdateSquadCounter();
        }

        void HandleInput()
        {
            // Mouse/Touch input for horizontal movement
            float horizontalInput = 0f;

            #if UNITY_EDITOR || UNITY_STANDALONE
            // Desktop input
            horizontalInput = Input.GetAxis("Horizontal");

            // Mouse dragging
            if (Input.GetMouseButton(0))
            {
                Vector3 mousePos = Camera.main.ScreenToWorldPoint(Input.mousePosition);
                targetPosition.x = Mathf.Clamp(mousePos.x, -movementBoundaryX, movementBoundaryX);
            }
            #else
            // Mobile touch input
            if (Input.touchCount > 0)
            {
                Touch touch = Input.GetTouch(0);
                Vector3 touchPos = Camera.main.ScreenToWorldPoint(touch.position);
                targetPosition.x = Mathf.Clamp(touchPos.x, -movementBoundaryX, movementBoundaryX);
            }
            #endif

            // Keyboard movement
            if (Mathf.Abs(horizontalInput) > 0.1f)
            {
                targetPosition.x += horizontalInput * horizontalSpeed * Time.deltaTime;
                targetPosition.x = Mathf.Clamp(targetPosition.x, -movementBoundaryX, movementBoundaryX);
            }

            // Smooth movement toward target
            Vector3 currentPos = transform.position;
            currentPos.x = Mathf.Lerp(currentPos.x, targetPosition.x, Time.deltaTime * 10f);
            transform.position = currentPos;
        }

        void InitializeSquad(int size)
        {
            currentSquadSize = size;

            // Clear existing squad
            foreach (var member in squadMembers)
            {
                if (member != null)
                    Destroy(member.gameObject);
            }
            squadMembers.Clear();

            // Create new squad members
            for (int i = 0; i < size; i++)
            {
                CreateSquadMember();
            }
        }

        void CreateSquadMember()
        {
            Vector3 randomOffset = Random.insideUnitSphere * formationRadius;
            randomOffset.y = 0; // Keep on ground plane

            GameObject memberObj = Instantiate(squadMemberPrefab, transform.position + randomOffset, Quaternion.identity, transform);
            SquadMember member = memberObj.GetComponent<SquadMember>();

            if (member == null)
                member = memberObj.AddComponent<SquadMember>();

            member.Initialize(this);
            squadMembers.Add(member);
        }

        void UpdateFormation()
        {
            // Blob formation using boid-like behavior
            foreach (var member in squadMembers)
            {
                if (member == null) continue;

                Vector3 separation = Vector3.zero;
                Vector3 cohesion = transform.position;
                int neighborCount = 0;

                // Calculate separation from other members
                foreach (var other in squadMembers)
                {
                    if (other == null || other == member) continue;

                    Vector3 diff = member.transform.position - other.transform.position;
                    float distance = diff.magnitude;

                    if (distance < formationRadius)
                    {
                        separation += diff.normalized / Mathf.Max(distance, 0.1f);
                        neighborCount++;
                    }
                }

                // Apply forces
                Vector3 targetVelocity = Vector3.zero;

                if (neighborCount > 0)
                {
                    separation = separation.normalized * separationForce;
                    targetVelocity += separation;
                }

                // Cohesion - move toward squad center
                Vector3 toCohesion = (cohesion - member.transform.position).normalized * cohesionForce;
                targetVelocity += toCohesion;

                // Apply velocity
                member.ApplyVelocity(targetVelocity);
            }
        }

        void HandleShooting()
        {
            shootTimer += Time.deltaTime;

            if (shootTimer >= shootInterval)
            {
                shootTimer = 0f;
                ShootAll();
            }
        }

        void ShootAll()
        {
            foreach (var member in squadMembers)
            {
                if (member != null)
                {
                    member.Shoot();
                }
            }
        }

        public void ModifySquadSize(int amount)
        {
            int newSize = currentSquadSize + amount;

            // Game over if we lose all members
            if (newSize <= 0)
            {
                GameManager.Instance.GameOver();
                return;
            }

            if (amount > 0)
            {
                // Add members
                for (int i = 0; i < amount; i++)
                {
                    CreateSquadMember();
                }
            }
            else if (amount < 0)
            {
                // Remove members
                int toRemove = Mathf.Min(Mathf.Abs(amount), squadMembers.Count);
                for (int i = 0; i < toRemove; i++)
                {
                    if (squadMembers.Count > 0)
                    {
                        int lastIndex = squadMembers.Count - 1;
                        SquadMember member = squadMembers[lastIndex];
                        squadMembers.RemoveAt(lastIndex);

                        if (member != null)
                            Destroy(member.gameObject);
                    }
                }
            }

            currentSquadSize = newSize;

            // Update UI
            if (GameManager.Instance != null && GameManager.Instance.uiManager != null)
            {
                GameManager.Instance.uiManager.UpdateSquadCount(currentSquadSize);
            }
        }

        void UpdateSquadCounter()
        {
            currentSquadSize = squadMembers.Count;
        }

        public Color GetBulletColor()
        {
            // Change bullet color based on squad size
            if (currentSquadSize < 5)
                return Color.yellow;
            else if (currentSquadSize < 10)
                return Color.green;
            else if (currentSquadSize < 20)
                return Color.cyan;
            else
                return Color.magenta;
        }

        public List<SquadMember> GetSquadMembers()
        {
            return squadMembers;
        }
    }
}
