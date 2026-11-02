import { useEffect, useState } from "react";

const currencies = [
  "USD",
  "PKR",
  "EUR",
  "GBP",
  "INR",
  "AED",
  "SAR",
  "CAD",
  "AUD",
  "JPY",
  "CNY",
  "TRY",
];

function App() {
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("PKR");
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function convertCurrency() {
      setLoading(true);
      setError("");
      setResult(null);
      setRate(null);

      try {
        const response = await fetch(
          `https://open.er-api.com/v6/latest/${fromCurrency}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Unable to fetch exchange rates.");
        }

        const data = await response.json();

        if (data.result !== "success" || !data.rates) {
          throw new Error("Exchange rates are unavailable.");
        }

        const exchangeRate = data.rates[toCurrency];

        if (typeof exchangeRate !== "number") {
          throw new Error("This currency is not supported.");
        }

        setRate(exchangeRate);

        const numericAmount = Number(amount);

        if (
          amount.trim() !== "" &&
          Number.isFinite(numericAmount) &&
          numericAmount >= 0
        ) {
          setResult(numericAmount * exchangeRate);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to load exchange rates. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    convertCurrency();

    return () => controller.abort();
  }, [fromCurrency, toCurrency, amount]);

  function swapCurrencies() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl">
            💱
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Currency Converter
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Convert currencies using exchange rates
          </p>
        </div>

        {/* Amount */}
        <div className="mb-5">
          <label
            htmlFor="amount"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Enter Amount
          </label>

          <input
            id="amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-lg outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Currency Selection */}
        <div className="relative mb-6 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <div>
            <label
              htmlFor="fromCurrency"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              From
            </label>

            <select
              id="fromCurrency"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 font-semibold outline-none focus:border-indigo-500"
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={swapCurrencies}
            aria-label="Swap currencies"
            title="Swap currencies"
            className="mb-1 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-2xl text-white transition hover:bg-indigo-700 active:scale-95"
          >
            ⇄
          </button>

          <div>
            <label
              htmlFor="toCurrency"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              To
            </label>

            <select
              id="toCurrency"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 font-semibold outline-none focus:border-indigo-500"
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        <div className="rounded-2xl bg-indigo-600 p-6 text-white">
          <p className="text-sm font-medium text-indigo-100">
            Converted Amount
          </p>

          {loading ? (
            <p className="mt-3 text-lg">Loading exchange rate...</p>
          ) : error ? (
            <p role="alert" className="mt-3 text-sm">
              {error}
            </p>
          ) : result !== null ? (
            <>
              <h2 className="mt-2 break-words text-3xl font-bold sm:text-4xl">
                {result.toLocaleString("en-US", {
                  maximumFractionDigits: 4,
                })}{" "}
                <span className="text-xl">{toCurrency}</span>
              </h2>

              {rate !== null && (
                <p className="mt-4 border-t border-indigo-400 pt-4 text-sm text-indigo-100">
                  1 {fromCurrency} ={" "}
                  {rate.toLocaleString("en-US", {
                    maximumFractionDigits: 6,
                  })}{" "}
                  {toCurrency}
                </p>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm">
              Enter a valid amount to see the result.
            </p>
          )}
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          Exchange rates are provided by an external API. Actual bank rates and
          fees may differ.
        </p>
      </div>
    </div>
  );
}

export default App;
