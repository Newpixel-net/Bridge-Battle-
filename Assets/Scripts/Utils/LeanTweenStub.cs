using UnityEngine;

namespace BridgeBattle
{
    /// <summary>
    /// Simplified stub for LeanTween functionality
    /// Replace with actual LeanTween package for full features
    /// </summary>
    public static class LeanTween
    {
        public static LTDescr scale(GameObject target, Vector3 to, float time)
        {
            return new LTDescr(target, to, time, LTType.Scale);
        }

        public static LTDescr alpha(GameObject target, float to, float time)
        {
            return new LTDescr(target, to, time, LTType.Alpha);
        }

        public static void cancel(GameObject target)
        {
            // Cancel all tweens on target
        }
    }

    public enum LTType
    {
        Scale,
        Alpha
    }

    public enum LeanTweenType
    {
        easeOutBack,
        linear
    }

    public class LTDescr
    {
        private GameObject target;
        private Vector3 vectorTo;
        private float floatTo;
        private float time;
        private float delay;
        private LTType type;
        private LeanTweenType easeType;
        private int loopCount;
        private bool pingPong;

        public LTDescr(GameObject target, Vector3 to, float time, LTType type)
        {
            this.target = target;
            this.vectorTo = to;
            this.time = time;
            this.type = type;
            this.easeType = LeanTweenType.linear;

            Execute();
        }

        public LTDescr(GameObject target, float to, float time, LTType type)
        {
            this.target = target;
            this.floatTo = to;
            this.time = time;
            this.type = type;
            this.easeType = LeanTweenType.linear;

            Execute();
        }

        public LTDescr setEase(LeanTweenType ease)
        {
            this.easeType = ease;
            return this;
        }

        public LTDescr setDelay(float delay)
        {
            this.delay = delay;
            return this;
        }

        public LTDescr setLoopPingPong(int count)
        {
            this.loopCount = count;
            this.pingPong = true;
            return this;
        }

        private void Execute()
        {
            if (target != null)
            {
                var tweener = target.GetComponent<SimpleTweener>();
                if (tweener == null)
                {
                    tweener = target.AddComponent<SimpleTweener>();
                }

                tweener.StartTween(this);
            }
        }

        public void Apply(float t)
        {
            if (target == null) return;

            float easedT = ApplyEase(t, easeType);

            switch (type)
            {
                case LTType.Scale:
                    Vector3 startScale = Vector3.one;
                    target.transform.localScale = Vector3.Lerp(startScale, vectorTo, easedT);
                    break;

                case LTType.Alpha:
                    var renderers = target.GetComponentsInChildren<Renderer>();
                    foreach (var renderer in renderers)
                    {
                        if (renderer != null)
                        {
                            Color color = renderer.material.color;
                            color.a = Mathf.Lerp(color.a, floatTo, easedT);
                            renderer.material.color = color;
                        }
                    }
                    break;
            }
        }

        private float ApplyEase(float t, LeanTweenType ease)
        {
            switch (ease)
            {
                case LeanTweenType.easeOutBack:
                    float s = 1.70158f;
                    t = t - 1f;
                    return t * t * ((s + 1f) * t + s) + 1f;

                default:
                    return t;
            }
        }
    }

    public class SimpleTweener : MonoBehaviour
    {
        private LTDescr currentTween;
        private float timer;

        public void StartTween(LTDescr tween)
        {
            currentTween = tween;
            timer = 0f;
        }

        private void Update()
        {
            if (currentTween != null)
            {
                timer += Time.deltaTime;
                float progress = Mathf.Clamp01(timer / 0.3f); // Default 0.3s duration

                currentTween.Apply(progress);

                if (progress >= 1f)
                {
                    currentTween = null;
                }
            }
        }
    }
}
