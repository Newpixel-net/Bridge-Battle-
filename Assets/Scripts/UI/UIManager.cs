using UnityEngine;
using TMPro;
using UnityEngine.UI;

namespace BridgeBattle
{
    /// <summary>
    /// Manages all UI elements: score, level, squad counter, game over screen
    /// All elements are oversized for mobile visibility
    /// </summary>
    public class UIManager : MonoBehaviour
    {
        [Header("HUD Elements")]
        public TextMeshProUGUI scoreText;
        public TextMeshProUGUI levelText;
        public TextMeshProUGUI squadCountText;
        public Image squadIcon;

        [Header("Game Over")]
        public GameObject gameOverPanel;
        public TextMeshProUGUI gameOverScoreText;
        public Button restartButton;

        [Header("Settings")]
        public float squadCountPulseScale = 1.2f;
        public float pulseDuration = 0.2f;

        private void Start()
        {
            if (gameOverPanel != null)
                gameOverPanel.SetActive(false);

            if (restartButton != null)
            {
                restartButton.onClick.AddListener(OnRestartClicked);
            }
        }

        public void UpdateScore(int score)
        {
            if (scoreText != null)
            {
                scoreText.text = "SCORE: " + score.ToString();
            }
        }

        public void UpdateLevel(int level)
        {
            if (levelText != null)
            {
                levelText.text = "LEVEL " + level.ToString();
            }
        }

        public void UpdateSquadCount(int count)
        {
            if (squadCountText != null)
            {
                squadCountText.text = count.ToString();

                // Pulse animation
                LeanTween.cancel(squadCountText.gameObject);
                squadCountText.transform.localScale = Vector3.one;
                LeanTween.scale(squadCountText.gameObject, Vector3.one * squadCountPulseScale, pulseDuration)
                    .setEase(LeanTweenType.easeOutBack)
                    .setLoopPingPong(1);
            }
        }

        public void ShowGameOver(int finalScore)
        {
            if (gameOverPanel != null)
            {
                gameOverPanel.SetActive(true);
            }

            if (gameOverScoreText != null)
            {
                gameOverScoreText.text = "FINAL SCORE: " + finalScore.ToString();
            }
        }

        void OnRestartClicked()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.RestartGame();
            }
        }
    }
}
