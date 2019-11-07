import { PapiConfig } from './@types'
import { Papi } from './lib/papi'

export default function (args: PapiConfig): Papi {
  return new Papi(args)
}
