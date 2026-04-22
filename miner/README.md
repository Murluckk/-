# keccak-of-address vanity miner

Ищет EOA, у которого `keccak256(address)` начинается с заданного байтового префикса
(по умолчанию `0x00000000`).

Это та же задача, что решают «vanity»-майнеры типа `profanity2` / `create2crunch` /
`vanity-eth` / `ethvanity`, только сравнение сдвинуто на один хеш:

```
classic vanity:   address                         starts with pattern
this miner:       keccak256(address_bytes_20)     starts with pattern
```

## Сборка

Нужен Rust ≥ 1.83.

```bash
cd miner
cargo build --release
```

Бинарник: `miner/target/release/keccak-of-address-miner`.

## Использование

```bash
# default: prefix = 0x00000000 (4 bytes), все ядра, остановка после 1 матча
./target/release/keccak-of-address-miner

# свой префикс, N матчей
./target/release/keccak-of-address-miner --prefix 00000000 --count 10

# крутить до Ctrl+C
./target/release/keccak-of-address-miner --count 0

# бенч на 10 секунд
./target/release/keccak-of-address-miner --bench 10

# число потоков
./target/release/keccak-of-address-miner --threads 8
```

### Формат вывода

Для каждого найденного ключа одна строка в stdout:

```
MATCH priv=0x<64hex> addr=0x<40hex> keccak_addr=0x<64hex>
```

- `priv` — 32‑байтный приватный ключ secp256k1.
- `addr` — 20‑байтный Ethereum-адрес (нижний регистр, без EIP‑55 чек‑суммы).
- `keccak_addr` — `keccak256(addr_bytes_20)`, начинается с запрошенного префикса.

Прогресс и статистика пишутся в stderr, так что `... > matches.txt` даст чистый список.

### Ожидаемое время

Вероятность матча на префикс длины N байт = `1 / 2^(8N)`. Ожидаемое число попыток:

| prefix    | expected tries |
|-----------|---------------:|
| `0x0000`      |         2^16 |
| `0x000000`    |         2^24 |
| `0x00000000`  |         2^32 |
| `0x0000000000`|         2^40 |

Один `addr/s` = один derive `privkey → pubkey → keccak → addr → keccak(addr)`.
На типичном современном CPU ядре это ~60–80k addr/s (секп опечатка: secp256k1
mult доминирует). Для `0x00000000` это часы на 4 ядрах и минуты-единицы минут
на 32–64 ядрах.

## Проверка

`cargo test --release` прогоняет в том числе известный вектор
`priv = 0x00..01 → addr = 0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf`.

Независимая проверка найденного ключа в Python:

```python
from eth_keys import keys
from eth_utils import keccak
pk = keys.PrivateKey(bytes.fromhex("..."))
addr = pk.public_key.to_canonical_address()        # 20 bytes
print(keccak(addr).hex())                           # должен начинаться с 00000000
```

## Безопасность

Приватные ключи генерируются из `OsRng` + инкремент счётчика. Не публикуйте
их. Если ключ нужен для реального on‑chain использования — сразу перекладывайте
в холодное хранилище.

## Почему CPU, а не GPU здесь

GPU-майнеры на порядки быстрее, потому что secp256k1 point multiplication
и keccak отлично параллелятся на OpenCL/CUDA. Однако:

- Готовые форки (`profanity2`, `create2crunch`) имеют свой GPU‑kernel,
  где условие матча захардкожено «начало адреса == паттерн».
  Чтобы искать по `keccak(address)`, в kernel нужно добавить ещё один
  `keccak256` поверх получившихся 20 байт адреса и сравнивать уже его
  первые байты.
- На этой машине нет GPU/OpenCL, поэтому поставляется CPU‑майнер;
  он самодостаточен, корректен (см. тесты) и годится для коротких
  префиксов и отладки.

### Скетч изменения для `profanity2` (OpenCL)

В kernel после получения `address[20]` добавить:

```c
// hash address once more
uchar h2[32];
keccak256(address, 20, h2);

// match on first 4 bytes of h2 instead of address
if (h2[0] == 0 && h2[1] == 0 && h2[2] == 0 && h2[3] == 0) {
    // report (privkey, address, h2) as in original
}
```

Всё остальное (генерация приватных ключей, scalar mult, отчёты) не меняется.

Тот же принцип — для `create2crunch`: заменить проверку префикса адреса на
проверку префикса `keccak256(address)`.
