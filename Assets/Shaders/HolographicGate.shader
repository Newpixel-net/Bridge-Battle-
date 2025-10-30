Shader "BridgeBattle/HolographicGate"
{
    Properties
    {
        _MainColor ("Main Color", Color) = (0.2, 0.5, 1.0, 0.6)
        _EdgeColor ("Edge Color", Color) = (0.5, 0.8, 1.0, 1.0)
        _RimPower ("Rim Power", Range(0.1, 8.0)) = 3.0
        _Intensity ("Intensity", Range(0.0, 3.0)) = 1.5
        _PulseSpeed ("Pulse Speed", Float) = 2.0
        _ScanlineSpeed ("Scanline Speed", Float) = 1.0
        _ScanlineScale ("Scanline Scale", Float) = 10.0
        _Glitch ("Glitch Amount", Range(0.0, 1.0)) = 0.1
    }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" }
        LOD 200
        Blend SrcAlpha OneMinusSrcAlpha
        ZWrite Off
        Cull Off

        CGPROGRAM
        #pragma surface surf Standard alpha vertex:vert
        #pragma target 3.0

        struct Input
        {
            float2 uv_MainTex;
            float3 viewDir;
            float3 worldPos;
        };

        fixed4 _MainColor;
        fixed4 _EdgeColor;
        half _RimPower;
        half _Intensity;
        float _PulseSpeed;
        float _ScanlineSpeed;
        float _ScanlineScale;
        float _Glitch;

        void vert (inout appdata_full v)
        {
            // Add subtle vertex displacement for holographic effect
            float glitch = sin(_Time.y * 20.0 + v.vertex.x * 10.0) * _Glitch * 0.01;
            v.vertex.x += glitch;
        }

        void surf (Input IN, inout SurfaceOutputStandard o)
        {
            // Rim lighting for holographic edge glow
            half rim = 1.0 - saturate(dot(normalize(IN.viewDir), o.Normal));
            half rimEffect = pow(rim, _RimPower);

            // Scanlines moving effect
            float scanline = sin(IN.worldPos.y * _ScanlineScale + _Time.y * _ScanlineSpeed);
            scanline = scanline * 0.5 + 0.5; // Remap to 0-1

            // Pulsing effect
            float pulse = sin(_Time.y * _PulseSpeed) * 0.3 + 0.7;

            // Combine effects
            fixed4 hologramColor = lerp(_MainColor, _EdgeColor, rimEffect);
            hologramColor.rgb *= (scanline * 0.3 + 0.7) * pulse * _Intensity;

            // Glitch effect
            float glitchNoise = frac(sin(dot(IN.worldPos.xz, float2(12.9898, 78.233))) * 43758.5453);
            if (glitchNoise > 0.98 && sin(_Time.y * 10.0) > 0.5)
            {
                hologramColor.rgb += _EdgeColor.rgb * 0.5;
            }

            o.Albedo = hologramColor.rgb;
            o.Emission = hologramColor.rgb * _Intensity;
            o.Alpha = hologramColor.a * (rimEffect * 0.5 + 0.5);
        }
        ENDCG
    }
    FallBack "Transparent/Diffuse"
}
