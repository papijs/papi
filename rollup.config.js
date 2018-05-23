import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import eslint from 'rollup-plugin-eslint';
import pkg from './package.json';

export default [
    // browser-friendly UMD build
    {
        input: 'src/index.js',
        output: {
            file: pkg.browser,
            format: 'umd',
            name: 'mapi',
            sourceMap: true
        },
        plugins: [
            eslint(),
            json(),
            resolve({ jsnext: true, preferBuiltins: true, browser: true }), // so Rollup can find `axios`
            commonjs(), // so Rollup can convert `axios` to an ES module
            babel({
                exclude: ['node_modules/**']
            })
        ]
    },

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // the `targets` option which can specify `dest` and `format`)
    {
        input: 'src/index.js',
        external: ['axios'],
        output: [
            { file: pkg.main, format: 'cjs' },
            { file: pkg.module, format: 'es' }
        ],
        plugins: [
            eslint(),
            json(),
            resolve({ jsnext: true, preferBuiltins: true, browser: true }),
            babel({
                exclude: ['node_modules/**']
            })
        ]
    }
];