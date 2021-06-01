export const formatJSON = json => {
  return JSON.stringify(json, null, ' ')
}

export const safeParse = json => {
  try {
    return JSON.parse(json)
  } catch (e) {
    return {}
  }
}
