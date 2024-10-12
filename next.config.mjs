/** @type {import('next').NextConfig} */

export default {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'nongburang-images.s3.ap-northeast-2.amazonaws.com',
          pathname: '/**',
        },
      ],
    },
  };

