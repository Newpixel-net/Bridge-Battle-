using UnityEngine;
using UnityEngine.SceneManagement;

namespace BridgeBattle
{
    /// <summary>
    /// Main game manager controlling game state, score, and level progression
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Game State")]
        public int currentScore = 0;
        public int currentLevel = 1;
        public bool isGameOver = false;

        [Header("References")]
        public SquadManager squadManager;
        public UIManager uiManager;
        public LevelManager levelManager;

        [Header("Game Settings")]
        public float scrollSpeed = 5f;
        public int scorePerObstacle = 10;
        public int scorePerEnemy = 15;

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
        }

        private void Start()
        {
            StartGame();
        }

        public void StartGame()
        {
            isGameOver = false;
            currentScore = 0;
            Time.timeScale = 1f;

            if (uiManager != null)
            {
                uiManager.UpdateScore(currentScore);
                uiManager.UpdateLevel(currentLevel);
            }
        }

        public void AddScore(int points)
        {
            currentScore += points;
            if (uiManager != null)
            {
                uiManager.UpdateScore(currentScore);
            }
        }

        public void GameOver()
        {
            if (isGameOver) return;

            isGameOver = true;
            Time.timeScale = 0f;

            if (uiManager != null)
            {
                uiManager.ShowGameOver(currentScore);
            }
        }

        public void RestartGame()
        {
            Time.timeScale = 1f;
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
        }

        public void NextLevel()
        {
            currentLevel++;
            if (uiManager != null)
            {
                uiManager.UpdateLevel(currentLevel);
            }

            if (levelManager != null)
            {
                levelManager.GenerateNextSegment();
            }
        }
    }
}
