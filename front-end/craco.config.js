module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            const sourceMapRule = webpackConfig.module.rules.find(
                (rule) =>
                    rule.enforce === 'pre' &&
                    rule.use &&
                    rule.use.includes('source-map-loader')
            );

            if (sourceMapRule) {
                sourceMapRule.exclude = [
                    ...(sourceMapRule.exclude || []),
                    /node_modules\/@stomp\/stompjs/,
                ];
            }

            return webpackConfig;
        },
    },
};
