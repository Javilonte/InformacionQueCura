import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    name?: string;
    type?: string;
    canonical?: string;
}

export function SEO({ title, description, name = 'InformacionQueCura', type = 'website', canonical }: SEOProps) {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title} | {name}</title>
            <meta name='description' content={description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />

            {canonical && <link rel="canonical" href={canonical} />}
        </Helmet>
    );
}
