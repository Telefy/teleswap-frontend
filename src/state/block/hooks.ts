import useSWRImmutable from 'swr/immutable'

export const useInitialBlock = (): number => {
  const { data: initialBlock = 0 } = useSWRImmutable('initialBlockNumber')
  return initialBlock
}
