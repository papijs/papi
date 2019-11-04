import { PapiConfig } from './@types'
import { Papi } from './lib/papi'

export default function (args: PapiConfig) {
  return new Papi(args)
}
