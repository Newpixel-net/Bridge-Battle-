Shader "BridgeBattle/WaterShader"
{
    Properties
    {
        _Color ("Water Color", Color) = (0.2, 0.5, 0.8, 0.8)
        _DeepColor ("Deep Water Color", Color) = (0.1, 0.3, 0.6, 1.0)
        _WaveSpeed ("Wave Speed", Float) = 1.0
        _WaveAmplitude1 ("Wave Amplitude 1", Float) = 0.5
        _WaveFrequency1 ("Wave Frequency 1", Float) = 1.0
        _WaveDirection1 ("Wave Direction 1", Vector) = (1, 0, 0, 0)
        _WaveAmplitude2 ("Wave Amplitude 2", Float) = 0.3
        _WaveFrequency2 ("Wave Frequency 2", Float) = 1.5
        _WaveDirection2 ("Wave Direction 2", Vector) = (0, 1, 0, 0)
        _WaveAmplitude3 ("Wave Amplitude 3", Float) = 0.2
        _WaveFrequency3 ("Wave Frequency 3", Float) = 2.0
        _WaveDirection3 ("Wave Direction 3", Vector) = (1, 1, 0, 0)
        _WaveAmplitude4 ("Wave Amplitude 4", Float) = 0.15
        _WaveFrequency4 ("Wave Frequency 4", Float) = 3.0
        _WaveDirection4 ("Wave Direction 4", Vector) = (-1, 1, 0, 0)
        _Glossiness ("Smoothness", Range(0,1)) = 0.8
        _Metallic ("Metallic", Range(0,1)) = 0.2
    }
    SubShader
    {
        Tags { "RenderType"="Transparent" "Queue"="Transparent" }
        LOD 200

        CGPROGRAM
        // Physically based Standard lighting model with vertex modification
        #pragma surface surf Standard alpha vertex:vert
        #pragma target 3.0

        struct Input
        {
            float2 uv_MainTex;
            float3 worldPos;
        };

        fixed4 _Color;
        fixed4 _DeepColor;
        float _WaveSpeed;

        float _WaveAmplitude1;
        float _WaveFrequency1;
        float4 _WaveDirection1;

        float _WaveAmplitude2;
        float _WaveFrequency2;
        float4 _WaveDirection2;

        float _WaveAmplitude3;
        float _WaveFrequency3;
        float4 _WaveDirection3;

        float _WaveAmplitude4;
        float _WaveFrequency4;
        float4 _WaveDirection4;

        half _Glossiness;
        half _Metallic;

        // Calculate wave height using multiple sine waves
        float CalculateWave(float3 position, float amplitude, float frequency, float2 direction, float speed)
        {
            float2 dir = normalize(direction);
            float wave = amplitude * sin(frequency * (dot(dir, position.xz) + _Time.y * speed));
            return wave;
        }

        void vert (inout appdata_full v)
        {
            float3 worldPos = mul(unity_ObjectToWorld, v.vertex).xyz;

            // Stack multiple sine waves for realistic water
            float wave = 0.0;
            wave += CalculateWave(worldPos, _WaveAmplitude1, _WaveFrequency1, _WaveDirection1.xy, _WaveSpeed);
            wave += CalculateWave(worldPos, _WaveAmplitude2, _WaveFrequency2, _WaveDirection2.xy, _WaveSpeed * 0.8);
            wave += CalculateWave(worldPos, _WaveAmplitude3, _WaveFrequency3, _WaveDirection3.xy, _WaveSpeed * 1.2);
            wave += CalculateWave(worldPos, _WaveAmplitude4, _WaveFrequency4, _WaveDirection4.xy, _WaveSpeed * 1.5);

            v.vertex.y += wave;

            // Recalculate normals for proper lighting
            float offset = 0.1;
            float3 tangent = float3(1, 0, 0);
            float3 bitangent = float3(0, 0, 1);

            float waveX = CalculateWave(worldPos + tangent * offset, _WaveAmplitude1, _WaveFrequency1, _WaveDirection1.xy, _WaveSpeed);
            waveX += CalculateWave(worldPos + tangent * offset, _WaveAmplitude2, _WaveFrequency2, _WaveDirection2.xy, _WaveSpeed * 0.8);
            waveX += CalculateWave(worldPos + tangent * offset, _WaveAmplitude3, _WaveFrequency3, _WaveDirection3.xy, _WaveSpeed * 1.2);
            waveX += CalculateWave(worldPos + tangent * offset, _WaveAmplitude4, _WaveFrequency4, _WaveDirection4.xy, _WaveSpeed * 1.5);

            float waveZ = CalculateWave(worldPos + bitangent * offset, _WaveAmplitude1, _WaveFrequency1, _WaveDirection1.xy, _WaveSpeed);
            waveZ += CalculateWave(worldPos + bitangent * offset, _WaveAmplitude2, _WaveFrequency2, _WaveDirection2.xy, _WaveSpeed * 0.8);
            waveZ += CalculateWave(worldPos + bitangent * offset, _WaveAmplitude3, _WaveFrequency3, _WaveDirection3.xy, _WaveSpeed * 1.2);
            waveZ += CalculateWave(worldPos + bitangent * offset, _WaveAmplitude4, _WaveFrequency4, _WaveDirection4.xy, _WaveSpeed * 1.5);

            tangent.y = (waveX - wave) / offset;
            bitangent.y = (waveZ - wave) / offset;

            v.normal = normalize(cross(bitangent, tangent));
        }

        void surf (Input IN, inout SurfaceOutputStandard o)
        {
            // Color based on depth simulation
            float depth = sin(IN.worldPos.x * 0.1 + _Time.y * 0.5) * 0.5 + 0.5;
            fixed4 c = lerp(_DeepColor, _Color, depth);

            o.Albedo = c.rgb;
            o.Metallic = _Metallic;
            o.Smoothness = _Glossiness;
            o.Alpha = c.a;
        }
        ENDCG
    }
    FallBack "Transparent/Diffuse"
}
