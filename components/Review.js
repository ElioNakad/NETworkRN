import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* =============================
   🔹 DATE FORMATTER
============================= */
const formatDateTime = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


export default function Reviews({ route }) {
  const { contact, defaultDescriptions } = route.params;

  const [selectedLabel, setSelectedLabel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [review, setReview] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [currentUserId, setCurrentUserId] = useState(null);


  const url="192.168.16.105"

  /* =============================
     🔹 FETCH REVIEWS
  ============================= */
  const loadReviews = async (label) => {
    try {
      setSelectedLabel(label);
      setLoadingReviews(true);

      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        `http://${url}:3000/api/review/my-reviews?labelId=${label.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setReviews(data.reviews);
      setCurrentUserId(data.currentUserId);

    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoadingReviews(false);
    }
  };

  /* =============================
     🔹 SUBMIT REVIEW
  ============================= */
  const submitReview = async () => {
    if (!review.trim()) {
      Alert.alert("Error", "Review cannot be empty");
      return;
    }

    try {
      setLoadingSubmit(true);
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        "http://"+url+":3000/api/review/insert-review",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            default_description_id: selectedLabel.id,
            review,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Alert.alert("Success", "Review submitted ⭐");
      setModalVisible(false);
      setReview("");

      loadReviews(selectedLabel);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const deleteReview = async (reviewId) => {
    console.log("DELETING review_id:", reviewId);
  Alert.alert(
    "Delete review",
    "Are you sure you want to delete this review?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");

            const res = await fetch(
              `http://${url}:3000/api/review/delete-review/${reviewId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await res.json();

            if (!res.ok) {
              Alert.alert("Delete failed", data.message);
              return;
            }

            // ✅ FIXED LINE
            setReviews(prev =>
              prev.filter(r => r.review_id !== reviewId)
            );

          } catch (err) {
            Alert.alert("Delete failed", err.message);
          }
        },
      },
    ]
  );
};



  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Reviews</Text>
        <Text style={styles.contactName}>{contact.display_name}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= LABELS ================= */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a Category</Text>

          {defaultDescriptions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.labelCard,
                selectedLabel?.id === item.id && styles.activeLabel,
              ]}
              onPress={() => loadReviews(item)}
              activeOpacity={0.7}
            >
              <View style={styles.labelHeader}>
                <Text
                  style={[
                    styles.label,
                    selectedLabel?.id === item.id && styles.activeLabelText,
                  ]}
                >
                  {item.label}
                </Text>
                {selectedLabel?.id === item.id && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.description}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= REVIEWS ================= */}
        {selectedLabel && (
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <Text style={styles.categoryBadge}>
                {selectedLabel.label}
              </Text>
            </View>

            {loadingReviews && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f5b400" />
                <Text style={styles.loadingText}>Loading reviews...</Text>
              </View>
            )}

            {!loadingReviews && reviews.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>No reviews yet</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to add a review!
                </Text>
              </View>
            )}

            {!loadingReviews &&
              reviews.map((r, index) => {
                const isMine = r.reviewer_id === currentUserId;
                return(
                <View key={r.review_id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {r.reviewer_fname?.[0]}
                        {r.reviewer_lname?.[0]}
                      </Text>
                    </View>

                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewer}>
                        {r.reviewer_fname} {r.reviewer_lname} {"\n"+r.reviewer_email}
                      </Text>

                      {isMine && (
                        <View style={styles.myBadge}>
                         <TouchableOpacity onPress={() => deleteReview(r.review_id)}>
                         <Text style={styles.myBadgeText}>🗑️</Text>
                         </TouchableOpacity>
                        </View>
                      )}

                      <Text style={styles.reviewMeta}>
                        {formatDateTime(r.review_date)} · Review #{reviews.length - index}
                      </Text>

                    </View>
                  </View>

                  <Text style={styles.reviewText}>{r.review_text}</Text>
                </View>
              
              )})
            }
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ================= FAB ================= */}
      {selectedLabel && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.fabText}>✍️</Text>
        </TouchableOpacity>
      )}

      {/* ================= MODAL ================= */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalCategoryTag}>
              <Text style={styles.modalCategoryText}>
                {selectedLabel?.label}
              </Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Share your thoughts..."
              multiline
              value={review}
              onChangeText={setReview}
              maxLength={500}
            />

            <Text style={styles.charCount}>{review.length}/500</Text>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={submitReview}
              disabled={loadingSubmit}
            >
              {loadingSubmit ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =============================
   🔹 STYLES
============================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },

  header: {
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
  },

  title: { fontSize: 28, fontWeight: "700" },
  contactName: { fontSize: 16, color: "#666" },

  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },

  labelCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e8ecf1",
  },

  activeLabel: {
    borderColor: "#f5b400",
    backgroundColor: "#fffbf0",
  },

  labelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: { fontSize: 16, fontWeight: "700" },
  activeLabelText: { color: "#f5b400" },

  description: { color: "#666", marginTop: 6 },

  selectedBadge: {
    backgroundColor: "#f5b400",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedBadgeText: { color: "#fff", fontWeight: "700" },

  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  categoryBadge: {
    backgroundColor: "#f5b400",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "700",
  },

  reviewCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
  },

  reviewHeader: { flexDirection: "row", marginBottom: 12 },

  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5b400",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: { color: "#fff", fontWeight: "700" },

  reviewer: { fontWeight: "700" },
  reviewMeta: { fontSize: 12, color: "#999" },

  reviewText: { marginTop: 6, color: "#444", lineHeight: 22 },

  loadingContainer: { alignItems: "center", paddingVertical: 40 },
  loadingText: { marginTop: 12 },

  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 48 },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    backgroundColor: "#f5b400",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },

  fabText: { fontSize: 28 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  modalTitle: { fontSize: 22, fontWeight: "700" },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCategoryTag: {
    marginTop: 12,
    marginBottom: 16,
    borderColor: "#f5b400",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  modalCategoryText: { color: "#f5b400", fontWeight: "600" },

  input: {
    borderWidth: 1,
    borderColor: "#e8ecf1",
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
  },

  charCount: { textAlign: "right", color: "#999", marginTop: 6 },

  submitButton: {
    backgroundColor: "#f5b400",
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    alignItems: "center",
  },

  submitText: { color: "#fff", fontWeight: "700" },
});
