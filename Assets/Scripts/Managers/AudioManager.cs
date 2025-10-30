using UnityEngine;

namespace BridgeBattle
{
    /// <summary>
    /// Manages all game audio: shooting, explosions, collecting items
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        public static AudioManager Instance { get; private set; }

        [Header("Audio Sources")]
        public AudioSource sfxSource;
        public AudioSource musicSource;

        [Header("Sound Effects")]
        public AudioClip shootSound;
        public AudioClip explosionSound;
        public AudioClip hitSound;
        public AudioClip collectSound;
        public AudioClip gateSound;
        public AudioClip gameOverSound;

        [Header("Settings")]
        public float sfxVolume = 0.7f;
        public float musicVolume = 0.5f;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
                return;
            }

            SetupAudioSources();
        }

        void SetupAudioSources()
        {
            if (sfxSource == null)
            {
                GameObject sfxObj = new GameObject("SFXSource");
                sfxObj.transform.SetParent(transform);
                sfxSource = sfxObj.AddComponent<AudioSource>();
                sfxSource.playOnAwake = false;
            }

            if (musicSource == null)
            {
                GameObject musicObj = new GameObject("MusicSource");
                musicObj.transform.SetParent(transform);
                musicSource = musicObj.AddComponent<AudioSource>();
                musicSource.loop = true;
                musicSource.playOnAwake = false;
            }

            sfxSource.volume = sfxVolume;
            musicSource.volume = musicVolume;
        }

        public void PlayShoot()
        {
            if (shootSound != null && sfxSource != null)
            {
                sfxSource.PlayOneShot(shootSound, sfxVolume * 0.3f);
            }
        }

        public void PlayExplosion()
        {
            if (explosionSound != null && sfxSource != null)
            {
                sfxSource.PlayOneShot(explosionSound, sfxVolume);
            }
        }

        public void PlayHit()
        {
            if (hitSound != null && sfxSource != null)
            {
                sfxSource.PlayOneShot(hitSound, sfxVolume * 0.5f);
            }
        }

        public void PlayCollect()
        {
            if (collectSound != null && sfxSource != null)
            {
                sfxSource.PlayOneShot(collectSound, sfxVolume);
            }
        }

        public void PlayGate()
        {
            if (gateSound != null && sfxSource != null)
            {
                sfxSource.PlayOneShot(gateSound, sfxVolume);
            }
        }

        public void PlayGameOver()
        {
            if (gameOverSound != null && sfxSource != null)
            {
                sfxSource.PlayOneShot(gameOverSound, sfxVolume);
            }
        }

        public void PlayMusic(AudioClip clip)
        {
            if (musicSource != null && clip != null)
            {
                musicSource.clip = clip;
                musicSource.Play();
            }
        }

        public void StopMusic()
        {
            if (musicSource != null)
            {
                musicSource.Stop();
            }
        }

        public void SetSFXVolume(float volume)
        {
            sfxVolume = Mathf.Clamp01(volume);
            if (sfxSource != null)
            {
                sfxSource.volume = sfxVolume;
            }
        }

        public void SetMusicVolume(float volume)
        {
            musicVolume = Mathf.Clamp01(volume);
            if (musicSource != null)
            {
                musicSource.volume = musicVolume;
            }
        }
    }
}
