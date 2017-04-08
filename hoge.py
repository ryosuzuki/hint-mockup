def repeated(f, n):
  if n == 0:
    return identity

  func, k = f, 1
  while k<n:
    func, k = compose1(f, func), k+1
  return func
def compose1(f, g):
  def h(x):
    return f(g(x))
  return h

def square(x):
  return x * x

print repeated(square, 0)(5)