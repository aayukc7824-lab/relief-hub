import { defaultPortfolioContent, validatePortfolioContent } from '../content.js';
import { portfolioSupabase } from '../backend.js';

const loginForm = document.querySelector('#login-form');
const portfolioForm = document.querySelector('#portfolio-form');
const setupNote = document.querySelector('#setup-note');
const message = document.querySelector('#editor-message');
const saveButton = document.querySelector('#save-button');
const signoutButton = document.querySelector('#signout-button');
const connectionLabel = document.querySelector('#editor-connection');
const connectionDot = document.querySelector('#editor-connection-dot');
let liveChannel;

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle('is-error', isError);
}

function setFormContent(content) {
  for (const input of portfolioForm.elements) {
    if (!input.name) continue;
    const value = input.name.split('.').reduce((current, key) => current?.[key], content);
    if (typeof value === 'string') input.value = value;
  }
}

function getFormContent() {
  const content = structuredClone(defaultPortfolioContent);
  for (const input of portfolioForm.elements) {
    if (!input.name) continue;
    const keys = input.name.split('.');
    const field = keys.pop();
    const target = keys.reduce((current, key) => current[key], content);
    target[field] = input.value.trim();
  }
  return content;
}

async function showEditor(user) {
  const { data, error } = await portfolioSupabase
    .from('portfolio_admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) {
    console.error('Unable to verify portfolio editor access', error);
    loginForm.hidden = false;
    showMessage('Your portfolio editor access could not be verified. Please try again.', true);
    return;
  }
  if (!data) {
    showMessage('This account has not been approved to edit the portfolio.', true);
    await portfolioSupabase.auth.signOut();
    return;
  }

  const result = await portfolioSupabase
    .from('portfolio_content')
    .select('content')
    .eq('id', 'main')
    .single();
  if (result.error) {
    console.error('Unable to load portfolio content', result.error);
    showMessage('Could not load the saved portfolio content. Check the database setup and try again.', true);
    return;
  }

  setFormContent(result.data.content);
  loginForm.hidden = true;
  portfolioForm.hidden = false;
  showMessage(`Signed in as ${user.email}.`);
  liveChannel = portfolioSupabase
    .channel('portfolio-editor-content')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'portfolio_content',
      filter: 'id=eq.main',
    }, (payload) => {
      if (portfolioForm.dataset.dirty === 'true' && portfolioForm.dataset.saving !== 'true') {
        showMessage('A newer version was published in another editor session. Save your changes to publish yours.', true);
      } else if (portfolioForm.dataset.saving !== 'true') {
        setFormContent(payload.new.content);
        showMessage('Portfolio updated from another session.');
      }
    })
    .subscribe((status) => {
      connectionDot.classList.toggle('is-connected', status === 'SUBSCRIBED');
      connectionLabel.textContent = status === 'SUBSCRIBED'
        ? 'Live connection active'
        : 'Connecting to live updates…';
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`Portfolio editor realtime connection status: ${status}`);
      }
    });
}

for (const input of portfolioForm.elements) {
  if (!input.name) continue;
  input.addEventListener('input', () => {
    portfolioForm.dataset.dirty = 'true';
  });
}

if (!portfolioSupabase) {
  setupNote.hidden = false;
  showMessage('Supabase is not configured for this site yet.', true);
} else {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    showMessage('Signing in…');
    const formData = new FormData(loginForm);
    const { data, error } = await portfolioSupabase.auth.signInWithPassword({
      email: formData.get('email').trim(),
      password: formData.get('password'),
    });
    submitButton.disabled = false;
    if (error) {
      console.error('Portfolio editor sign-in failed', error);
      showMessage('Sign-in failed. Check your email and password, then try again.', true);
      return;
    }
    await showEditor(data.user);
  });

  portfolioForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!portfolioForm.reportValidity()) return;
    const content = getFormContent();
    const validationError = validatePortfolioContent(content);
    if (validationError) {
      showMessage(validationError, true);
      return;
    }
    saveButton.disabled = true;
    portfolioForm.dataset.saving = 'true';
    showMessage('Saving and publishing…');
    const { error } = await portfolioSupabase
      .from('portfolio_content')
      .update({ content })
      .eq('id', 'main')
      .select('id')
      .single();
    saveButton.disabled = false;
    if (error) {
      console.error('Unable to publish portfolio content', error);
      portfolioForm.dataset.saving = 'false';
      showMessage('The changes could not be saved. Please try again.', true);
      return;
    }
    portfolioForm.dataset.saving = 'false';
    portfolioForm.dataset.dirty = 'false';
    showMessage('Saved. The public portfolio is being updated now.');
  });

  signoutButton.addEventListener('click', async () => {
    signoutButton.disabled = true;
    const { error } = await portfolioSupabase.auth.signOut();
    signoutButton.disabled = false;
    if (error) {
      console.error('Unable to sign out from portfolio editor', error);
      showMessage('Sign-out failed. Please try again.', true);
      return;
    }
    if (liveChannel) await portfolioSupabase.removeChannel(liveChannel);
    loginForm.reset();
    loginForm.hidden = false;
    portfolioForm.hidden = true;
    portfolioForm.dataset.dirty = 'false';
    showMessage('You have signed out.');
  });

  portfolioSupabase.auth.getSession().then(async ({ data, error }) => {
    if (error) {
      console.error('Unable to restore portfolio editor session', error);
      showMessage('Could not restore your sign-in. Please sign in again.', true);
    }
    if (data.session?.user) await showEditor(data.session.user);
    else loginForm.hidden = false;
  });
}
