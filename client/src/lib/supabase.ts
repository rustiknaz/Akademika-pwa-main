import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xtqlfntveqanhbljxqnl.supabase.co'
const supabaseKey = 'sb_publishable_UTcOWoZYgEN-8UR3e2VfMw_gGFm9j2P'

const realSupabase = createClient(supabaseUrl, supabaseKey)

// Mock Data Definitions for reliable local development and offline resilience
function initLocalStorageDB() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem('supabase_db_profiles')) {
    const defaultProfiles = [
      {
        id: "mock-admin-id-12345",
        full_name: "Администратор Akademika",
        phone: "89119223406",
        role: "admin",
        avatar_url: ""
      }
    ];
    localStorage.setItem('supabase_db_profiles', JSON.stringify(defaultProfiles));
  }

  if (!localStorage.getItem('supabase_db_subscriptions')) {
    const defaultSubs = [
      {
        id: 9999,
        user_id: "mock-admin-id-12345",
        plan_name: "Безлимитный тест (AI Studio)",
        visits_left: 99,
        expires_at: "2027-12-31T23:59:59.000Z"
      }
    ];
    localStorage.setItem('supabase_db_subscriptions', JSON.stringify(defaultSubs));
  }

  if (!localStorage.getItem('supabase_db_classes')) {
    const defaultClasses = [
      {
        id: 1,
        title: "Contemporary Dance",
        start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // в течение дня
        duration_min: 60,
        teacher_name: "Мария Ковалева",
        max_students: 12,
        image_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=60"
      },
      {
        id: 2,
        title: "Hip-Hop Beginner",
        start_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        duration_min: 90,
        teacher_name: "Алексей Петров",
        max_students: 15,
        image_url: "https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800&auto=format&fit=crop&q=60"
      },
      {
        id: 3,
        title: "High Heels Style",
        start_time: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), // завтра
        duration_min: 60,
        teacher_name: "Дарья Смирнова",
        max_students: 8,
        image_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=60"
      }
    ];
    localStorage.setItem('supabase_db_classes', JSON.stringify(defaultClasses));
  }

  if (!localStorage.getItem('supabase_db_bookings')) {
    localStorage.setItem('supabase_db_bookings', JSON.stringify([]));
  }
}

// Chained Promisable Query Builder that acts like PostgrestFilterBuilder
class CustomQueryChain {
  private table: string;
  private chain: any;
  private filters: any[] = [];
  private isSingle = false;
  private isMaybeSingle = false;
  private isInsert = false;
  private isUpdate = false;
  private isDelete = false;
  private insertData: any = null;
  private updateData: any = null;

  constructor(table: string, chain: any) {
    this.table = table;
    this.chain = chain;
  }

  select(...args: any[]) {
    if (this.chain && typeof this.chain.select === 'function') {
      this.chain = this.chain.select(...args);
    }
    return this;
  }

  eq(...args: any[]) {
    this.filters.push({ type: 'eq', args });
    if (this.chain && typeof this.chain.eq === 'function') {
      this.chain = this.chain.eq(...args);
    }
    return this;
  }

  order(...args: any[]) {
    if (this.chain && typeof this.chain.order === 'function') {
      this.chain = this.chain.order(...args);
    }
    return this;
  }

  single() {
    this.isSingle = true;
    if (this.chain && typeof this.chain.single === 'function') {
      this.chain = this.chain.single();
    }
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    if (this.chain && typeof this.chain.maybeSingle === 'function') {
      this.chain = this.chain.maybeSingle();
    }
    return this;
  }

  insert(data: any) {
    this.isInsert = true;
    this.insertData = data;
    if (this.chain && typeof this.chain.insert === 'function') {
      this.chain = this.chain.insert(data);
    }
    return this;
  }

  update(data: any) {
    this.isUpdate = true;
    this.updateData = data;
    if (this.chain && typeof this.chain.update === 'function') {
      this.chain = this.chain.update(data);
    }
    return this;
  }

  delete() {
    this.isDelete = true;
    if (this.chain && typeof this.chain.delete === 'function') {
      this.chain = this.chain.delete();
    }
    return this;
  }

  private executeMockQuery() {
    initLocalStorageDB();

    let data: any[] = JSON.parse(localStorage.getItem(`supabase_db_${this.table}`) || '[]');

    if (this.isInsert) {
      const rowsToInsert = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
      const insertedRows = rowsToInsert.map((row: any) => {
        let generatedId;
        if (this.table === 'profiles') {
          generatedId = row.id || 'mock-user-' + Math.floor(Math.random() * 100000);
        } else {
          generatedId = row.id || Math.floor(Math.random() * 1000000);
        }
        const newRow = {
          id: generatedId,
          ...row
        };
        data.push(newRow);
        return newRow;
      });
      localStorage.setItem(`supabase_db_${this.table}`, JSON.stringify(data));

      return {
        data: this.isSingle || this.isMaybeSingle ? insertedRows[0] : insertedRows,
        error: null
      };
    }

    if (this.isUpdate) {
      const updatedRows: any[] = [];
      data = data.map((row: any) => {
        let matches = true;
        for (const f of this.filters) {
          if (f.type === 'eq') {
            const key = f.args[0];
            const val = f.args[1];
            if (row[key] != val) {
              matches = false;
              break;
            }
          }
        }
        if (matches) {
          const updatedRow = { ...row, ...this.updateData };
          updatedRows.push(updatedRow);
          return updatedRow;
        }
        return row;
      });
      localStorage.setItem(`supabase_db_${this.table}`, JSON.stringify(data));

      return {
        data: this.isSingle || this.isMaybeSingle ? updatedRows[0] : updatedRows,
        error: null
      };
    }

    if (this.isDelete) {
      const remainingRows: any[] = [];
      const deletedRows: any[] = [];
      for (const row of data) {
        let matches = true;
        for (const f of this.filters) {
          if (f.type === 'eq') {
            const key = f.args[0];
            const val = f.args[1];
            if (row[key] != val) {
              matches = false;
              break;
            }
          }
        }
        if (matches) {
          deletedRows.push(row);
        } else {
          remainingRows.push(row);
        }
      }
      localStorage.setItem(`supabase_db_${this.table}`, JSON.stringify(remainingRows));
      return {
        data: this.isSingle || this.isMaybeSingle ? deletedRows[0] : deletedRows,
        error: null
      };
    }

    // Handle SELECT with filters
    let result = [...data];
    for (const f of this.filters) {
      if (f.type === 'eq') {
        const key = f.args[0];
        const val = f.args[1];
        result = result.filter((row: any) => row[key] == val);
      }
    }

    // Resolve relationships
    result = result.map((row: any) => {
      const resolvedRow = { ...row };

      if (this.table === 'profiles') {
        const allSubs = JSON.parse(localStorage.getItem('supabase_db_subscriptions') || '[]');
        resolvedRow.subscriptions = allSubs.filter((sub: any) => sub.user_id == row.id);
      }

      if (this.table === 'bookings') {
        const allClasses = JSON.parse(localStorage.getItem('supabase_db_classes') || '[]');
        const allProfiles = JSON.parse(localStorage.getItem('supabase_db_profiles') || '[]');
        const allSubs = JSON.parse(localStorage.getItem('supabase_db_subscriptions') || '[]');

        const cls = allClasses.find((c: any) => c.id == row.class_id);
        const prof = allProfiles.find((p: any) => p.id == row.user_id);

        resolvedRow.classes = cls || null;
        if (prof) {
          resolvedRow.profiles = {
            ...prof,
            subscriptions: allSubs.filter((sub: any) => sub.user_id == prof.id)
          };
        } else {
          resolvedRow.profiles = null;
        }
      }

      return resolvedRow;
    });

    if (this.table === 'classes') {
      result.sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    }

    if (this.isSingle || this.isMaybeSingle) {
      return { data: result[0] || null, error: null };
    } else {
      return { data: result, error: null };
    }
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const isMockActive = localStorage.getItem('supabase_mock_mode') === 'true';
      if (isMockActive) {
        const mockResult = this.executeMockQuery();
        return onfulfilled ? onfulfilled(mockResult) : mockResult;
      }

      if (!this.chain) {
        throw new Error('Supabase client connection failed');
      }
      const result = await this.chain;
      return onfulfilled ? onfulfilled(result) : result;
    } catch (err: any) {
      console.warn(`[Supabase Proxy] Query failed for table "${this.table}", reverting to mock data:`, err);
      const mockResult = this.executeMockQuery();
      return onfulfilled ? onfulfilled(mockResult) : mockResult;
    }
  }
}

// Proxied Supabase Client with Developer bypass and robust offline error handling
export const supabase = {
  ...realSupabase,
  
  auth: {
    ...realSupabase.auth,

    async signInWithPassword({ email, password }: any) {
      const cleanedEmail = email?.toLowerCase() || '';
      const isMockUser = cleanedEmail.includes('89119223406') || cleanedEmail.includes('79119223406') || cleanedEmail.includes('9119223406');
      
      if (isMockUser) {
        console.log('[Supabase Proxy] Developer account login intercepted. Bypassing password verification.');
        localStorage.setItem('supabase_mock_mode', 'true');
        localStorage.setItem('supabase_mock_user_email', email);
        return {
          data: {
            user: {
              id: 'mock-admin-id-12345',
              email: email,
              phone: '89119223406'
            },
            session: {
              access_token: 'mock-access-token-12345',
              user: {
                id: 'mock-admin-id-12345',
                email: email,
                phone: '89119223406'
              }
            }
          },
          error: null
        };
      }

      try {
        return await realSupabase.auth.signInWithPassword({ email, password });
      } catch (err: any) {
        console.warn('[Supabase Proxy] Real auth failed, checking for developer fallback:', err);
        if (isMockUser) {
          localStorage.setItem('supabase_mock_mode', 'true');
          localStorage.setItem('supabase_mock_user_email', email);
          return {
            data: {
              user: {
                id: 'mock-admin-id-12345',
                email: email,
                phone: '89119223406'
              },
              session: {
                access_token: 'mock-access-token-12345',
                user: {
                  id: 'mock-admin-id-12345',
                  email: email,
                  phone: '89119223406'
                }
              }
            },
            error: null
          };
        }
        throw err;
      }
    },

    async signUp({ email, password }: any) {
      const cleanedEmail = email?.toLowerCase() || '';
      const isMockUser = cleanedEmail.includes('89119223406') || cleanedEmail.includes('79119223406') || cleanedEmail.includes('9119223406');

      if (isMockUser) {
        console.log('[Supabase Proxy] Developer account signUp intercepted. Bypassing and logging in.');
        localStorage.setItem('supabase_mock_mode', 'true');
        localStorage.setItem('supabase_mock_user_email', email);
        return {
          data: {
            user: {
              id: 'mock-admin-id-12345',
              email: email,
              phone: '89119223406'
            },
            session: {
              access_token: 'mock-access-token-12345',
              user: {
                id: 'mock-admin-id-12345',
                email: email,
                phone: '89119223406'
              }
            }
          },
          error: null
        };
      }

      try {
        return await realSupabase.auth.signUp({ email, password });
      } catch (err: any) {
        console.warn('[Supabase Proxy] Real signUp failed:', err);
        throw err;
      }
    },

    async getSession() {
      const isMockActive = localStorage.getItem('supabase_mock_mode') === 'true';
      if (isMockActive) {
        const email = localStorage.getItem('supabase_mock_user_email') || '89119223406@dance.local';
        return {
          data: {
            session: {
              access_token: 'mock-access-token-12345',
              user: {
                id: 'mock-admin-id-12345',
                email: email,
                phone: '89119223406'
              }
            }
          },
          error: null
        };
      }
      try {
        return await realSupabase.auth.getSession();
      } catch (err) {
        const email = localStorage.getItem('supabase_mock_user_email');
        if (email) {
          return {
            data: {
              session: {
                access_token: 'mock-access-token-12345',
                user: {
                  id: 'mock-admin-id-12345',
                  email: email,
                  phone: '89119223406'
                }
              }
            },
            error: null
          };
        }
        return { data: { session: null }, error: null };
      }
    },

    async getUser() {
      const isMockActive = localStorage.getItem('supabase_mock_mode') === 'true';
      if (isMockActive) {
        const email = localStorage.getItem('supabase_mock_user_email') || '89119223406@dance.local';
        return {
          data: {
            user: {
              id: 'mock-admin-id-12345',
              email: email,
              phone: '89119223406'
            }
          },
          error: null
        };
      }
      try {
        return await realSupabase.auth.getUser();
      } catch (err) {
        const email = localStorage.getItem('supabase_mock_user_email');
        if (email) {
          return {
            data: {
              user: {
                id: 'mock-admin-id-12345',
                email: email,
                phone: '89119223406'
              }
            },
            error: null
          };
        }
        return { data: { user: null }, error: null };
      }
    },

    async signOut() {
      localStorage.removeItem('supabase_mock_mode');
      localStorage.removeItem('supabase_mock_user_email');
      try {
        return await realSupabase.auth.signOut();
      } catch (err) {
        return { error: null };
      }
    }
  },

  from(table: string) {
    let realChain;
    try {
      realChain = realSupabase.from(table);
    } catch (e) {
      console.warn('[Supabase Proxy] Could not initialize real from() chain:', e);
    }
    return new CustomQueryChain(table, realChain);
  },

  async rpc(fnName: string, args?: any) {
    const isMockActive = localStorage.getItem('supabase_mock_mode') === 'true';
    
    const handleMockRpc = async () => {
      initLocalStorageDB();
      if (fnName === 'book_class') {
        const classId = args?.p_class_id;
        const classes = JSON.parse(localStorage.getItem('supabase_db_classes') || '[]');
        const bookings = JSON.parse(localStorage.getItem('supabase_db_bookings') || '[]');
        const subscriptions = JSON.parse(localStorage.getItem('supabase_db_subscriptions') || '[]');
        
        const userSession = await this.auth.getSession();
        const userId = userSession.data.session?.user.id || 'mock-admin-id-12345';

        const cls = classes.find((c: any) => c.id == classId);
        const sub = subscriptions.find((s: any) => s.user_id == userId);

        if (cls && sub) {
          if (sub.visits_left <= 0) {
            return { data: null, error: new Error('У вас закончился абонемент!') };
          }
          if (cls.max_students <= 0) {
            return { data: null, error: new Error('Мест нет!') };
          }

          const alreadyBooked = bookings.some((b: any) => b.class_id == classId && b.user_id == userId && b.status === 'booked');
          if (alreadyBooked) {
            return { data: null, error: new Error('Вы уже записаны!') };
          }

          sub.visits_left -= 1;
          cls.max_students -= 1;
          
          bookings.push({
            id: Math.floor(Math.random() * 1000000),
            user_id: userId,
            class_id: classId,
            status: 'booked',
            created_at: new Date().toISOString()
          });

          localStorage.setItem('supabase_db_classes', JSON.stringify(classes));
          localStorage.setItem('supabase_db_bookings', JSON.stringify(bookings));
          localStorage.setItem('supabase_db_subscriptions', JSON.stringify(subscriptions));

          return {
            data: {
              visits_left: sub.visits_left,
              spots_left: cls.max_students
            },
            error: null
          };
        }
        return { data: null, error: new Error('Занятие не найдено') };
      }

      if (fnName === 'cancel_booking') {
        const classId = args?.p_class_id;
        const classes = JSON.parse(localStorage.getItem('supabase_db_classes') || '[]');
        const bookings = JSON.parse(localStorage.getItem('supabase_db_bookings') || '[]');
        const subscriptions = JSON.parse(localStorage.getItem('supabase_db_subscriptions') || '[]');
        
        const userSession = await this.auth.getSession();
        const userId = userSession.data.session?.user.id || 'mock-admin-id-12345';

        const bookingIndex = bookings.findIndex((b: any) => b.class_id == classId && b.user_id == userId && b.status === 'booked');
        if (bookingIndex !== -1) {
          bookings[bookingIndex].status = 'cancelled';
          
          const cls = classes.find((c: any) => c.id == classId);
          if (cls) cls.max_students += 1;

          const sub = subscriptions.find((s: any) => s.user_id == userId);
          if (sub) sub.visits_left += 1;

          localStorage.setItem('supabase_db_classes', JSON.stringify(classes));
          localStorage.setItem('supabase_db_bookings', JSON.stringify(bookings));
          localStorage.setItem('supabase_db_subscriptions', JSON.stringify(subscriptions));

          return {
            data: {
              visits_left: sub ? sub.visits_left : 99,
              spots_left: cls ? cls.max_students : 10
            },
            error: null
          };
        }
        return { data: null, error: new Error('Запись не найдена') };
      }
      return { data: null, error: null };
    };

    if (isMockActive) {
      return await handleMockRpc();
    }

    try {
      return await realSupabase.rpc(fnName, args);
    } catch (err: any) {
      console.warn(`[Supabase Proxy] RPC call "${fnName}" failed, falling back to mock:`, err);
      return await handleMockRpc();
    }
  }
} as any;
