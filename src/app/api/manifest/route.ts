import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET() {
    const manifest = {
        name: "Kielinuppu",
        short_name: "Kielinuppu",
        description: "Varhaiskasvatuksen sovellus",
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#e9f1f3",
        theme_color: "#e9f1f3",
        orientation: "portrait-primary",
        lang: "fi",
        form_factor: "wide",
        form_factors: [
            {
                platform: "desktop",
                form_factor: "wide"
            },
            {
                platform: "mobile",
                form_factor: "wide"
            }
        ],
        icons: [
            {
                src: "/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any maskable"
            },
            {
                src: "/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any maskable"
            }
        ]
    }

    return new NextResponse(JSON.stringify(manifest), {
        status: 200,
        headers: {
            'content-type': 'application/manifest+json',
            'cache-control': 'public, max-age=0, must-revalidate'
        },
    })
}