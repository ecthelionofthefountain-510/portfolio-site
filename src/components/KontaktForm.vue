<script setup>
import { reactive, ref } from "vue";

const form = reactive({
  namn: "",
  epost: "",
  telefon: "",
  foretag: "",
  meddelande: "",
  "bot-field": "",
});

const errors = reactive({});
const status = ref("idle"); // idle | sending | success | error

function validate() {
  for (const key of Object.keys(errors)) delete errors[key];
  if (!form.namn.trim()) errors.namn = "Fyll i ditt namn.";
  if (!form.epost.trim()) {
    errors.epost = "Fyll i din e-post så jag kan svara.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.epost)) {
    errors.epost = "Kontrollera e-postadressen.";
  }
  if (!form.meddelande.trim()) {
    errors.meddelande = "Skriv några rader om vad du vill ha hjälp med.";
  }
  return Object.keys(errors).length === 0;
}

const encode = (data) =>
  Object.keys(data)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(data[k]))
    .join("&");

async function submit() {
  if (!validate()) return;
  status.value = "sending";
  try {
    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({ "form-name": "kontakt", ...form }),
    });
    if (!res.ok) throw new Error("Netlify svarade " + res.status);
    status.value = "success";
  } catch (e) {
    status.value = "error";
  }
}

const fieldClass =
  "w-full border border-sand bg-white px-4 py-3 text-ink outline-none focus:border-ink transition-colors";
</script>

<template>
  <div v-if="status === 'success'" class="border border-sand bg-white p-8">
    <h2 class="font-display text-2xl font-bold">Tack, jag har fått ditt meddelande!</h2>
    <p class="mt-3 leading-[1.7] text-ink-soft">
      Jag återkommer så snart jag kan, oftast inom ett dygn. Vill du lägga till
      något kan du bara svara på mejlet du får.
    </p>
  </div>

  <form
    v-else
    name="kontakt"
    method="POST"
    data-netlify="true"
    netlify-honeypot="bot-field"
    action="/tack/"
    class="grid gap-5"
    @submit.prevent="submit"
    novalidate
  >
    <!-- Krävs för Netlify: identifierar formuläret vid native POST (utan JS) -->
    <input type="hidden" name="form-name" value="kontakt" />

    <!-- Honeypot: dolt för människor, lockar bottar -->
    <p class="hidden" aria-hidden="true">
      <label>Lämna det här fältet tomt: <input name="bot-field" v-model="form['bot-field']" tabindex="-1" autocomplete="off" /></label>
    </p>

    <div>
      <label for="namn" class="font-display text-sm font-medium">Namn *</label>
      <input
        id="namn"
        name="namn"
        v-model="form.namn"
        :class="fieldClass"
        class="mt-1.5"
        :aria-invalid="errors.namn ? 'true' : undefined"
        :aria-describedby="errors.namn ? 'namn-fel' : undefined"
        autocomplete="name"
      />
      <p v-if="errors.namn" id="namn-fel" class="mt-1 text-sm text-raps-deep">{{ errors.namn }}</p>
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <div>
        <label for="epost" class="font-display text-sm font-medium">E-post *</label>
        <input
          id="epost"
          name="epost"
          type="email"
          v-model="form.epost"
          :class="fieldClass"
          class="mt-1.5"
          :aria-invalid="errors.epost ? 'true' : undefined"
          :aria-describedby="errors.epost ? 'epost-fel' : undefined"
          autocomplete="email"
        />
        <p v-if="errors.epost" id="epost-fel" class="mt-1 text-sm text-raps-deep">{{ errors.epost }}</p>
      </div>
      <div>
        <label for="telefon" class="font-display text-sm font-medium">Telefon</label>
        <input
          id="telefon"
          name="telefon"
          type="tel"
          v-model="form.telefon"
          :class="fieldClass"
          class="mt-1.5"
          autocomplete="tel"
        />
      </div>
    </div>

    <div>
      <label for="foretag" class="font-display text-sm font-medium">Företag</label>
      <input
        id="foretag"
        name="foretag"
        v-model="form.foretag"
        :class="fieldClass"
        class="mt-1.5"
        autocomplete="organization"
      />
    </div>

    <div>
      <label for="meddelande" class="font-display text-sm font-medium">Vad vill du ha hjälp med? *</label>
      <textarea
        id="meddelande"
        name="meddelande"
        v-model="form.meddelande"
        rows="6"
        :class="fieldClass"
        class="mt-1.5 resize-y"
        :aria-invalid="errors.meddelande ? 'true' : undefined"
        :aria-describedby="errors.meddelande ? 'meddelande-fel' : undefined"
      ></textarea>
      <p v-if="errors.meddelande" id="meddelande-fel" class="mt-1 text-sm text-raps-deep">{{ errors.meddelande }}</p>
    </div>

    <div class="flex flex-wrap items-center gap-4">
      <button
        type="submit"
        :disabled="status === 'sending'"
        class="inline-block bg-ink text-chalk font-display px-6 py-3 hover:bg-ink-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {{ status === "sending" ? "Skickar…" : "Skicka" }}
      </button>
      <p v-if="status === 'error'" class="text-sm text-raps-deep">
        Något gick fel när meddelandet skulle skickas. Försök igen, eller mejla mig direkt.
      </p>
    </div>
  </form>
</template>
