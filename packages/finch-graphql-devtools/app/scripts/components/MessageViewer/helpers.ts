export const formatJSON = <T extends {}>(json: T) => {
  return JSON.stringify(json, null, ' ')
}

export const safeParse = (json: string) => {
  try {
    return JSON.parse(json)
  } catch (e) {
    return {}
  }
}
