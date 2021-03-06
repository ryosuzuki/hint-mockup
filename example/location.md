# Description

The location hint provides information about which part of the student code is incorrect. For instance, a location hint for our running example would be: `“There is an error in line 3"`.
The level of abstraction of a location hint can vary. A more concrete hint would be: `“There is an error in the value assigned to the variable total in line 3”`. This type of information is easily extracted from a synthesized bug fix.


# Background

### Piazza 113

```python
return accumulate(combiner if pred(n) else add, base, n if pred(n) else 0, term)
```

[s] I'm not sure about how to call pred at every term. this is my code. would you mind give me a hint?

[i] **Take a look at your accumulate function** and see how those arguments would affect the flow of the `accumulate` program. Is it doing what you're expecting to? [id: 113]

---

### Piazza 108

```python
def count_change(amount):
  i = 0
  while 2**i <= amount:
    i += 1
  i = i -1
  def count_partitions(n, m):
    """Count the ways to partition n using parts up to m."""
    if n >= 0 and n <= 1:
      return 1
    elif m == 1:
      return 0
    elif n < 0:
      return 0
    else:
      return count_partitions(n-m, m) + count_partitions(n, m/2)

  return count_partitions(amount, 2**i)

>>> count_change(7)
2
# Error: expected
#     6
# but got
#     2
```

[s] I don't know which part is wrong? just cant get the right answer. Need some help~

[i] **It's your base case**. Look at the textbook for count_partitions again and think about why it works. [id: 108]


---

### Piazza 111

```python
def filtered_accumulate(combiner, base, pred, n, term):
  return accumulate(combiner, base, n, lambda n: n if pred(n)==True else base)

>>> filtered_accumulate(add, 0, true, 5, identity)  # 0 + 1 + 2 + 3 + 4 + 5
TypeError: unsupported operand type(s) for +: 'int' and 'function'
# Error: expected
#     15
# but got
#     TypeError
```

[s] I tried using a lambda function to replace the term function on filtered_accumulate, but now it's giving me a type error. I'm guessing this has something to do with the combiner? Any help would be appreciated!

[i] **It seems like it has to do something with your argument for term**, since you left `combiner` unchanged. [id: 111]

