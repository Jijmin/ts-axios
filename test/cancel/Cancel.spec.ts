import Cancel, { isCancel } from '../../src/cancel/Cancel'

describe('cancel:Cancel', () => {
  // 指定消息时应该返回正确的结果
  test('should returns correct result when message is specified', () => {
    const cancel = new Cancel('Operation has been canceled.')
    expect(cancel.message).toBe('Operation has been canceled.')
  })

  // 如果值是 Cancel 实例，应该返回true
  test('should returns true if value is a Cancel', () => {
    expect(isCancel(new Cancel())).toBeTruthy()
  })

  // 如果值不是 Cancel 实例，应该返回false
  test('should returns false if value is not a Cancel', () => {
    expect(isCancel({ foo: 'bar' })).toBeFalsy()
  })
})
