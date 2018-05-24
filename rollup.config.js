import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import minify from 'rollup-plugin-babel-minify';
import eslint from 'rollup-plugin-eslint';
import pkg from './package.json';

export default [

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // the `targets` option which can specify `dest` and `format`)
    {
        input: 'src/index.js',
        external: ['axios'],
        output: [
            { file: pkg.main, format: 'cjs' }
        ],
        plugins: [
            eslint(),
            json(),
            babel({
              exclude: ['node_modules/**']
            }),
            resolve({ jsnext: true, preferBuiltins: true, browser: true }),
            minify()
        ]
    }
];