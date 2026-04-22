# profanity2 — keccak-of-address patch (GPU)

GPU майнер для поиска EOA, у которого `keccak256(address)` начинается с заданного
байтового префикса (по умолчанию `0x00000000`).

Это fork-как-патч поверх [`1inch/profanity2`](https://github.com/1inch/profanity2):
добавлен новый OpenCL transform‑kernel `profanity_transform_keccak_address`,
новая цель `-k / --keccak-address` и автоматический выход по `-Q / --quit-score`.

Все изменения лежат в `gpu-miner/patches/` — это полные заменяемые версии
оригинальных файлов, не unified diff, чтобы не зависеть от форматирования upstream.

Оригинальный profanity2 дальше делает то, что и делал: никогда не генерит
приватный ключ сам, а возвращает публичный **offset** к твоему seed‑паблик‑ключу.
Итоговый приватный ключ считается у тебя локально как `secret + offset mod n`.
Это специально — так инструмент бесполезен для чужих ключей.

## Что внутри

```
gpu-miner/
├── Dockerfile                          # multi-stage: CUDA-devel -> CUDA-runtime
├── patches/
│   ├── profanity.cl                    # +profanity_transform_keccak_address
│   ├── Mode.hpp                        # + ADDRESS_KECCAK
│   ├── Mode.cpp                        # + transformKernel/Name mappings
│   └── profanity.cpp                   # + -k / --keccak-address, -Q / --quit-score
└── scripts/
    ├── run.sh                          # entrypoint в контейнере
    ├── gen-key.py                      # сгенерить seed-keypair ЛОКАЛЬНО
    └── verify.py                       # secret + offset → final privkey + verify
```

Pin'нутый upstream коммит: `13d16e83556b17a4ec6a09114f11a36b338acf05`.
Если upstream сдвинется и патч перестанет прикладываться, обнови `PROFANITY2_COMMIT`
в `Dockerfile` и проверь по `gpu-miner/patches` руками.

## Проверено локально

В этой репе локально (без GPU) прогнано:
- `make -j` патченого profanity2 — успешно, только upstream‑варнинги.
- OpenCL kernel компилируется на POCL 5.0 (CPU‑fallback) и экспортирует все
  13 kernels, включая новый `profanity_transform_keccak_address`.
- End-to-end тест kernel'а на известном адресе
  `0x8ad8552c...bf6208f5` → kernel возвращает ровно те же 20 байт, что выдаёт
  `eth_utils.keccak` в Python:
  `d22435ddda6e31649a5bbe13a11be9038e57d19e...`.

То есть математика патча уже валидирована. На реальной GPU сборка идёт тем же
путём (`NVIDIA OpenCL ICD` + тот же `profanity2.x64`), так что риск ограничен
платформенными нюансами CUDA/OpenCL-драйвера.

## Workflow

### 0. Локально (на ноуте): сгенерить seed

```bash
cd gpu-miner/scripts
pip install eth-keys "eth-hash[pycryptodome]"
python3 gen-key.py
# секрет НЕ уносим никуда. publicKey (128 hex) пойдёт на GPU-сервер.
```

Пример вывода:

```
secret=0x0e30...10d9       # <-- оставь ЛОКАЛЬНО и нигде не свети
publicKey=d17290fa...3c1d  # <-- это отдать в контейнер через -z
address=0x8ad8...08f5
keccak(address)=0xd224...22c1
```

### 1. На GPU‑сервере (vast.ai / RunPod / свой): собрать и запустить

С Docker (проще всего — NVIDIA Container Toolkit обычно уже стоит):

```bash
git clone --branch cursor/profanity2-keccak-patch-8ac1 <repo_url> repo
cd repo/gpu-miner

# build (занимает 1–3 минуты, ~200 МБ образ)
docker build -t keccak-vanity:latest .

# бенч (хэшрейт):
docker run --rm --gpus all keccak-vanity:latest \
    --bench -z <publicKey>

# поиск: >= 4 нулевых байта в keccak(address), выйти при первом совпадении
docker run --rm --gpus all keccak-vanity:latest \
    --zero-bytes --min 4 --quit-score 4 \
    -z <publicKey>
```

Без Docker (если на ноде уже стоят NVIDIA-драйверы + OpenCL ICD):

```bash
sudo apt-get install -y build-essential git ocl-icd-opencl-dev
git clone https://github.com/1inch/profanity2.git profanity2
cd profanity2
git checkout 13d16e83556b17a4ec6a09114f11a36b338acf05
cp ../gpu-miner/patches/*.cl ../gpu-miner/patches/*.cpp ../gpu-miner/patches/*.hpp .
make -j"$(nproc)"
./profanity2.x64 --keccak-address --zero-bytes --min 4 --quit-score 4 -z <publicKey>
```

### 2. Когда появится матч

profanity2 напечатает строку примерно такую (из ванильного форматтера):

```
  Time:    12s  Score:  4  Private: 0x18a9ef...3f  Address: 0x00abcd...
```

В нашем режиме поле `Address:` — это `keccak(final_address)[0..4]` плюс
хвост keccak‑а (все 20 байт), **не сам адрес**. Самое важное — `Private:`,
это **offset**, который ты добавишь к своему secret:

```bash
# локально
python3 verify.py <secret_hex> <offset_hex> 00000000
```

Скрипт напечатает `final_privkey`, `address`, `keccak(address)` и проверит
префикс. После этого финальный ключ можно импортить в любой кошелёк.

## Флаги

Из оригинального profanity2 работают все (`--matching`, `--zero-bytes`,
`--leading`, `--range`, и т.п.) — только теперь они применяются к
`keccak256(address)` вместо `address`, если передан `-k/--keccak-address`.

Дополнительно:

| Флаг | Что делает |
|------|------------|
| `-k`, `--keccak-address` | Считать ещё один keccak256 от 20‑байтного адреса и скорить уже по нему. По умолчанию выключено — ведёт себя как оригинал. |
| `-Q N`, `--quit-score N` | Выйти, как только найдётся первый матч со score ≥ N. У ванильного profanity2 этого не было: он крутится вечно и только повышает рекорд. |
| `-z <128 hex>` | **обязательно** — твой seed public key (uncompressed, без `0x04`). Без него приватный ключ не восстановить. |

Соответствие `score` для `--zero-bytes` и `--matching` — это **число совпавших
нулевых байт / hex-нибблов keccak(address)**. Для `0x00000000` (4 байта) ставь
`--min 4` (если `--zero-bytes`) или `--matching 00000000` и `--quit-score 4`.

## Оценка скорости

На одной современной GPU `profanity2` выдаёт:

| GPU | addr/s (без патча) | addr/s (с патчем, примерно) | время до `0x00000000` (среднее) |
|---|---:|---:|---:|
| RTX 4090 | 350–400 MH/s | 250–300 MH/s | ~15 с |
| RTX 3090 | 200–250 MH/s | 150–180 MH/s | ~25 с |
| RTX 3060 | 80–100 MH/s  | 60–75 MH/s   | ~60 с |
| A100 80GB | 300–400 MH/s | 220–300 MH/s | ~15 с |

(Цифры с патчем — оценка: `profanity_transform_keccak_address` добавляет ровно один
keccak permutation к уже выполняемым внутри pipeline; обычно это −20…−30% к
суммарному хэшрейту.)

Для 5 байт (`0x0000000000`) умножай время на 256, для 6 байт — на 65536, и т.д.

## Безопасность

- **Никогда** не отправляй свой `secret` на арендованный сервер. На GPU‑ноде
  используется только публичный ключ. Провайдер в худшем случае увидит только
  `publicKey` и `offset` — этого недостаточно для восстановления приватного ключа
  (нужен твой secret).
- Приватный ключ собирается **у тебя локально** через `verify.py`. Сразу
  после — в холодное хранилище.
- Снеси инстанс после работы (`Destroy` у Vast/RunPod). Это гарантированно
  стирает диск.

## Ограничения / TODO

- Я не гонял это на настоящей NVIDIA/AMD GPU. Код OpenCL‑kernel'а проверен на
  POCL (CPU) и выдаёт верный keccak, C++ часть компилируется чисто, но
  драйвер‑specific ругань возможна. Если что, build log смотреть через
  `make CDEFINES=-DPROFANITY_DEBUG=1`.
- Новый transform работает только в связке со score‑kernel'ами, которые читают
  `hash[0..19]` (`matching`, `zero-bytes`, `leading`, `range`, `leadingrange`).
  Kernel'ы `mirror` и `doubles` тоже формально будут работать, но их семантика
  на байтах keccak'а мало осмысленна.
