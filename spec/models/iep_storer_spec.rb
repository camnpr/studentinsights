require 'rails_helper'

RSpec.describe IepStorer, type: :model do
  class FakeAwsClient
    def self.put_object(args)
      {
        server_side_encryption: 'AES256'
      }
    end
  end

  class QuietLogger
    def self.info(message); end
  end

  before do
    allow(File).to receive(:open).and_call_original # ActiveSupport calls this for i8n translations
    allow(File).to receive(:open).with('/path/to/file').and_return 'eeee'
  end

  subject {
    IepStorer.new(
      file_name: 'IEP Document',
      path_to_file: '/path/to/file',
      local_id: 'abc_student_local_id',
      client: FakeAwsClient,
      logger: QuietLogger
    )
  }

  context 'local id matches to student' do
    let!(:student) {
      FactoryBot.create(:student, {
        local_id: 'abc_student_local_id',
        grade: 'KF'
      })
    }

    context 'no other document for that student' do
      it 'stores an object to the db' do
        expect { subject.store }.to change(IepDocument, :count).by 1
      end
    end

    context 'other document exists for that student' do
      let!(:other_iep) {
        IepDocument.create!(student: student, file_name: 'xyz')
      }

      it 'stores an object to the db' do
        expect { subject.store }.to change(IepDocument, :count).by 0
      end

      it 'updates the filename' do
        subject.store
        student.reload
        expect(student.iep_document.file_name).to eq 'IEP Document'
      end
    end
  end

  context 'local id does not match to student' do
    it 'does not store an object to the db' do
      expect { subject.store }.to change(IepDocument, :count).by 0
    end
  end

end
