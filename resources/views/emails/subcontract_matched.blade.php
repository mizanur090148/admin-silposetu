<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>নতুন সাবকন্ট্রাক্ট কাজের সুযোগ - শিল্পসেতু</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
        table { border-spacing: 0; border-collapse: collapse; }
        .wrapper { width: 100%; background-color: #f1f5f9; padding: 36px 0; }
        .container { max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #064e3b 100%); padding: 32px; text-align: center; }
        .header-logo { display: inline-block; background: rgba(255,255,255,0.12); padding: 6px 16px; border-radius: 9999px; color: #ffffff; font-size: 13px; font-weight: 700; margin-bottom: 10px; }
        .header-title { color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 4px 0; }
        .header-subtitle { color: #94a3b8; font-size: 13px; margin: 0; }
        .match-banner { background: #ecfdf5; border-bottom: 1px solid #a7f3d0; padding: 12px 24px; text-align: center; color: #065f46; font-size: 13px; font-weight: 700; }
        .content { padding: 28px 32px; }
        .order-title-box { background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 0 12px 12px 0; padding: 16px 20px; margin: 18px 0 22px 0; }
        .order-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; }
        .order-meta { font-size: 12px; color: #64748b; }
        .specs-table { width: 100%; margin-bottom: 22px; border: 1px solid #e2e8f0; }
        .specs-row { border-bottom: 1px solid #e2e8f0; }
        .specs-label { width: 40%; padding: 11px 14px; background-color: #f8fafc; font-size: 13px; font-weight: 600; color: #475569; }
        .specs-value { padding: 11px 14px; background-color: #ffffff; font-size: 14px; font-weight: 700; color: #0f172a; }
        .description-box { background-color: #fafaf9; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 24px; font-size: 13px; color: #334155; }
        .cta-wrapper { text-align: center; margin-bottom: 24px; }
        .cta-button { display: inline-block; background: #2563eb; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; }
        .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <div class="header-logo">শিল্পসেতু | SHILPOSETU</div>
                <h1 class="header-title">নতুন সাবকন্ট্রাক্ট কাজের সুযোগ</h1>
                <p class="header-subtitle">বাংলাদেশের বিশ্বস্ত নিটিং ও শিল্পোৎপাদন নেটওয়ার্ক</p>
            </div>

            <div class="match-banner">
                আপনার ফ্যাক্টরির সক্ষমতার সাথে মিলেছে: <strong>{{ $matchReason }}</strong>
            </div>

            <div class="content">
                <p>
                    সম্মানিত <strong>{{ $recipient->name ?? 'ফ্যাক্টরি পার্টনার' }}</strong>,<br>
                    শিল্পসেতু প্ল্যাটফর্মে একটি নতুন সাবকন্ট্রাক্ট পোস্ট যুক্ত হয়েছে। বিস্তারিত দেখে দ্রুত দরপত্র জমা দিন।
                </p>

                <div class="order-title-box">
                    <h2 class="order-title">{{ $post->title }}</h2>
                    <div class="order-meta">
                        পোস্ট করেছেন: <strong>{{ $posterName }}</strong> &bull; {{ $post->post_type === 'machine_available' ? 'ফ্রি মেশিন উপলব্ধ' : 'কাজের অফার' }}
                    </div>
                </div>

                <table class="specs-table">
                    <tr class="specs-row">
                        <td class="specs-label">ফ্যাব্রিক ধরন (Fabric Type)</td>
                        <td class="specs-value">{{ $post->fabric_type }} {{ $post->gsm ? '('.$post->gsm.')' : '' }}</td>
                    </tr>
                    @if($post->dia || $post->gauge)
                    <tr class="specs-row">
                        <td class="specs-label">মেশিন স্পেক (Dia × Gauge)</td>
                        <td class="specs-value">{{ $post->dia ? $post->dia.'"' : '—' }} × {{ $post->gauge ? $post->gauge.'G' : '—' }}</td>
                    </tr>
                    @endif
                    <tr class="specs-row">
                        <td class="specs-label">পরিমাণ (Quantity)</td>
                        <td class="specs-value">{{ number_format((float) $post->quantity_kg, 2) }} kg</td>
                    </tr>
                    <tr class="specs-row">
                        <td class="specs-label">টার্গেট রেট (Target Rate)</td>
                        <td class="specs-value">
                            @if($post->target_rate_tk)
                                ৳{{ number_format((float) $post->target_rate_tk, 2) }} / kg
                            @else
                                আলোচনা সাপেক্ষে
                            @endif
                        </td>
                    </tr>
                    @if($post->yarn_count)
                    <tr class="specs-row">
                        <td class="specs-label">সুতার কাউন্ট (Yarn Count)</td>
                        <td class="specs-value">{{ $post->yarn_count }}</td>
                    </tr>
                    @endif
                    <tr class="specs-row">
                        <td class="specs-label">এলাকা (Location)</td>
                        <td class="specs-value">{{ $post->location ?? 'বাংলাদেশ' }}</td>
                    </tr>
                    @if($post->delivery_deadline)
                    <tr class="specs-row">
                        <td class="specs-label">ডেলিভারি ডেডলাইন</td>
                        <td class="specs-value">{{ is_string($post->delivery_deadline) ? $post->delivery_deadline : $post->delivery_deadline->format('d M, Y') }}</td>
                    </tr>
                    @endif
                </table>

                @if($post->description)
                <div class="description-box">
                    <strong>বিবরণ:</strong><br>
                    {{ \Illuminate\Support\Str::limit($post->description, 280) }}
                </div>
                @endif

                <div class="cta-wrapper">
                    <a href="{{ $url }}" class="cta-button" target="_blank">বিস্তারিত দেখুন ও বিড করুন</a>
                </div>
            </div>

            <div class="footer">
                &copy; {{ date('Y') }} শিল্পসেতু (ShilpoSetu) প্ল্যাটফর্ম।
            </div>
        </div>
    </div>
</body>
</html>
