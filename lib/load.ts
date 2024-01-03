import * as utils from './utils'
import * as struct from './struct'
import { IExif, IExifElement } from './interfaces'
import { TagNumbers } from './constants'
import { ExifReader } from './exif_reader'

export const load = (bytes: string): IExif => {
  const exifBytes = getExifBytes(bytes)

  const exifObj: IExif = {}
  const exifReader = ExifReader.load(exifBytes)
  if (exifReader === null) {
    return exifObj
  }

  let firstIfd: IExifElement | undefined
  let exifIfd: IExifElement | undefined
  let interopIfd: IExifElement | undefined
  let gpsIfd: IExifElement | undefined
  let thumbnail: string | undefined
  const IFD_POINTER_BEGIN = 4
  const IFD_POINTER_LENGTH = 4

  const zerothIfdPointer = struct.unpack(
    exifReader.endianMark + 'L',
    exifReader.tiftag.slice(
      IFD_POINTER_BEGIN,
      IFD_POINTER_BEGIN + IFD_POINTER_LENGTH,
    ),
  )[0]

  const zerothIfd = exifReader.getIfd(zerothIfdPointer, '0th')
  exifObj['0th'] = zerothIfd

  if (zerothIfd?.[TagNumbers.ImageIFD.ExifTag]) {
    const exifIfdPointer = zerothIfd[TagNumbers.ImageIFD.ExifTag]
    exifIfd = exifReader.getIfd(exifIfdPointer as number, 'Exif')
    exifObj['Exif'] = exifIfd
  }

  if (zerothIfd?.[TagNumbers.ImageIFD.GPSTag]) {
    const gpsIfdPointer = zerothIfd[TagNumbers.ImageIFD.GPSTag]
    gpsIfd = exifReader.getIfd(gpsIfdPointer as number, 'GPS')
    exifObj['GPS'] = gpsIfd
  }

  if (exifIfd?.[TagNumbers.ExifIFD.InteroperabilityTag]) {
    const interopIfdPointer = exifIfd[TagNumbers.ExifIFD.InteroperabilityTag]
    interopIfd = exifReader.getIfd(interopIfdPointer as number, 'Interop')
    exifObj['Interop'] = interopIfd
  }

  const firstIfdPointerBytes = exifReader.getFirstIfdPointer(
    zerothIfdPointer,
    '0th',
  )

  // todo
  if (firstIfdPointerBytes === null) {
    throw new Error('null firstIfdPointerBytes')
  }

  if (firstIfdPointerBytes != '\x00\x00\x00\x00') {
    const firstIfdPointer = struct.unpack(
      exifReader.endianMark + 'L',
      firstIfdPointerBytes,
    )[0]
    firstIfd = exifReader.getIfd(firstIfdPointer, '1st')
    exifObj['1st'] = firstIfd
    if (
      firstIfd !== undefined &&
      TagNumbers.ImageIFD.JPEGInterchangeFormat in firstIfd &&
      TagNumbers.ImageIFD.JPEGInterchangeFormatLength in firstIfd
    ) {
      const thumbnailEnd =
        (firstIfd[TagNumbers.ImageIFD.JPEGInterchangeFormat] as number) +
        (firstIfd[TagNumbers.ImageIFD.JPEGInterchangeFormatLength] as number)
      thumbnail = exifReader.tiftag.slice(
        firstIfd[TagNumbers.ImageIFD.JPEGInterchangeFormat] as number,
        thumbnailEnd,
      )
      exifObj['thumbnail'] = thumbnail
    }
  }

  return exifObj
}

const getExifBytes = (bytes: string): string => {
  // eslint-disable-next-line no-constant-condition
  if (!(typeof bytes === 'string')) {
    throw new Error('\'load\' got invalid type of argument.')
  }

  if (bytes.slice(0, 2) == '\xff\xd8') {
    return bytes
  }

  if (
    bytes.slice(0, 23) == 'data:image/jpeg;base64,' ||
    bytes.slice(0, 22) == 'data:image/jpg;base64,'
  ) {
    return utils.atob(bytes.split(',')[1])
  }

  if (bytes.slice(0, 4) == 'Exif') {
    return bytes.slice(6)
  }

  throw new Error('\'load\' got invalid file data.')
}
