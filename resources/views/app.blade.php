<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ e($page['props']['seo']['meta_title'] ?? $page['props']['appName'] ?? config('app.name', 'Mine Invest App')) }}</title>

    @php
        $favicon = $page['props']['faviconUrl'] ?? asset('favicon.ico');
    @endphp
    <link rel="icon" href="{{ $favicon }}">
    <link rel="shortcut icon" href="{{ $favicon }}">

    @php
        $description = $page['props']['seo']['meta_description'] ?? '';
        $keywords = $page['props']['seo']['meta_keywords'] ?? '';
        $ogTitle = $page['props']['seo']['og_title'] ?? $page['props']['seo']['meta_title'] ?? $page['props']['appName'] ?? config('app.name');
        $ogDescription = $page['props']['seo']['og_description'] ?? $description;
        $ogImage = $page['props']['seo']['og_image_url'] ?? null;
    @endphp

    <link rel="canonical" href="{{ url()->current() }}">
    @if($description)
        <meta name="description" content="{{ e($description) }}">
    @endif
    @if($keywords)
        <meta name="keywords" content="{{ e($keywords) }}">
    @endif

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{ e($page['props']['appName'] ?? config('app.name')) }}">
    <meta property="og:title" content="{{ e($ogTitle) }}">
    <meta property="og:url" content="{{ url()->current() }}">
    @if($ogDescription)
        <meta property="og:description" content="{{ e($ogDescription) }}">
    @endif
    @if($ogImage)
        <meta property="og:image" content="{{ e($ogImage) }}">
        <meta property="og:image:alt" content="{{ e($ogTitle) }}">
    @endif

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ e($ogTitle) }}">
    @if($ogDescription)
        <meta name="twitter:description" content="{{ e($ogDescription) }}">
    @endif
    @if($ogImage)
        <meta name="twitter:image" content="{{ e($ogImage) }}">
    @endif

    <meta name="theme-color" content="#ffffff">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link rel="preload" href="{{ asset('css/all.min.css') }}" as="style">
    @if(!empty($page['props']['seo']['google_analytics']))
        <link rel="preconnect" href="https://www.googletagmanager.com">
        <link rel="dns-prefetch" href="https://www.googletagmanager.com">
    @endif

    <link rel="stylesheet" href="{{ asset('css/all.min.css') }}">

    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead

    @if(!empty($page['props']['seo']['google_analytics']))
        @php $gaId = e($page['props']['seo']['google_analytics']); @endphp
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ $gaId }}"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '{{ $gaId }}', {
                page_title: '{{ e($ogTitle) }}',
                page_location: '{{ url()->current() }}'
            });
        </script>
    @endif

    @if(!empty($page['props']['tawk']['property_id']) && !empty($page['props']['tawk']['widget_id']))
        @php
            $tawkPropertyId = e($page['props']['tawk']['property_id']);
            $tawkWidgetId = e($page['props']['tawk']['widget_id']);
        @endphp
        <script type="text/javascript">
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/{{ $tawkPropertyId }}/{{ $tawkWidgetId }}';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
            })();
        </script>
    @endif
</head>
<body class="font-sans antialiased">
@inertia
</body>
</html>
